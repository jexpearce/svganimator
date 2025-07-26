import { useEffect, useRef, RefObject, useMemo } from 'react';
import { primitives, enhanceDrawPathEffect } from '@motif/primitives';
import type { KeyframeEffectSpec, PrimitiveMap, SvgAnalysisResult } from '@motif/schema';

interface EnhancedPrimitivePlayerConfig<T extends keyof PrimitiveMap> {
  type: T;
  options: PrimitiveMap[T];
  metadata?: SvgAnalysisResult['metadata'];
}

/**
 * Enhanced version of usePrimitivePlayer that handles runtime measurements
 */
export function useEnhancedPrimitivePlayer<T extends keyof PrimitiveMap>(
  ref: RefObject<SVGSVGElement>,
  config: EnhancedPrimitivePlayerConfig<T> | null
) {
  const animationsRef = useRef<Animation[]>([]);
  
  // Serialize config to detect changes
  const configKey = useMemo(() => {
    if (!config) return null;
    return JSON.stringify({
      type: config.type,
      options: config.options,
      metadataClassification: config.metadata?.classification,
      metadataFlags: config.metadata?.flags
    });
  }, [config]);
  
  useEffect(() => {
    if (!ref.current || !config) return;
    
    // Clean up previous animations
    animationsRef.current.forEach(anim => anim.cancel());
    animationsRef.current = [];
    
    try {
      // Special handling for drawPath with runtime measurements
      if (config.type === 'drawPath') {
        if (!config.metadata) {
          throw new Error('drawPath requires metadata');
        }
        
        const effectSpec = primitives.drawPath(config.options as any, config.metadata);
        const targets = ref.current.querySelectorAll(effectSpec.targetSelector);
        
        targets.forEach((target, index) => {
          if (target instanceof SVGElement) {
            // Try to get enhanced effect with actual path length
            const enhancedEffect = enhanceDrawPathEffect(target, effectSpec.timing.duration);
            
            if (enhancedEffect) {
              const staggerDelay = (config.options as PrimitiveMap['drawPath']).stagger || 0;
              const baseDelay = Number(effectSpec.timing.delay) || 0;
              const delay = (baseDelay + (index * staggerDelay)) as number;
              
              const animation = new Animation(enhancedEffect, document.timeline);
              const now = Number(document.timeline.currentTime ?? 0);
              animation.startTime = now + delay;
              animation.play();
              animationsRef.current.push(animation);
            } else {
              // Fallback to standard animation  
              const staggerDelay = (config.options as PrimitiveMap['drawPath']).stagger || 0;
              const animation = target.animate(effectSpec.keyframes, {
                ...effectSpec.timing,
                delay: (Number(effectSpec.timing.delay) || 0) + (index * staggerDelay)
              });
              animationsRef.current.push(animation);
            }
          }
        });
        
        return;
      }
      
      // Standard primitive handling
      const primitiveFn = primitives[config.type];
      if (!primitiveFn) {
        throw new Error(`Unknown primitive: ${config.type}`);
      }
      
      let effectSpec: KeyframeEffectSpec;
      
      if (config.type === 'staggerFadeIn') {
        if (!config.metadata) {
          throw new Error('staggerFadeIn requires metadata');
        }
        effectSpec = (primitiveFn as any)(config.options, config.metadata);
      } else {
        effectSpec = (primitiveFn as any)(config.options);
      }
      
      // Find target elements
      const targets = ref.current.querySelectorAll(effectSpec.targetSelector);
      
      if (targets.length === 0) {
        console.warn(`No elements found for selector: ${effectSpec.targetSelector}`);
        return;
      }
      
      // Handle staggering if needed
      const isStagger = config.type === 'staggerFadeIn';
      const staggerDelay = isStagger ? (config.options as PrimitiveMap['staggerFadeIn']).stagger : 0;
      
      // Create animations for each target
      targets.forEach((target, index) => {
        const timing = {
          ...effectSpec.timing,
          delay: (effectSpec.timing.delay || 0) + (isStagger ? index * staggerDelay : 0)
        };
        
        const animation = target.animate(effectSpec.keyframes, timing);
        animationsRef.current.push(animation);
      });
    } catch (error) {
      console.error('Failed to play animation:', error);
    }
    
    // Cleanup
    return () => {
      animationsRef.current.forEach(anim => anim.cancel());
      animationsRef.current = [];
    };
  }, [ref, configKey, config]);
  
  return {
    animations: animationsRef.current,
    play: () => animationsRef.current.forEach(a => a.play()),
    pause: () => animationsRef.current.forEach(a => a.pause()),
    cancel: () => animationsRef.current.forEach(a => a.cancel())
  };
} 