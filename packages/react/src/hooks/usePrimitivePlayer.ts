import { useEffect, useRef, RefObject, useMemo } from 'react';
import { primitives } from '@motif/primitives';
import { logger } from '@motif/utils';
import type { KeyframeEffectSpec, PrimitiveMap, SvgAnalysisResult } from '@motif/schema';

interface PrimitivePlayerConfig<T extends keyof PrimitiveMap> {
  type: T;
  options: PrimitiveMap[T];
  metadata?: SvgAnalysisResult['metadata'];
}

/**
 * Hook that plays animation primitives using Web Animations API
 */
export function usePrimitivePlayer<T extends keyof PrimitiveMap>(
  ref: RefObject<SVGSVGElement>,
  config: PrimitivePlayerConfig<T> | null
) {
  const animationsRef = useRef<Animation[]>([]);
  
  // Serialize config to detect changes (deep comparison)
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
      // Get the primitive function with proper typing
      const primitiveFn = primitives[config.type];
      if (!primitiveFn) {
        throw new Error(`Unknown primitive: ${config.type}`);
      }
      
      // Generate the effect spec based on primitive type
      let effectSpec: KeyframeEffectSpec;
      
      if (config.type === 'drawPath') {
        if (!config.metadata) {
          throw new Error(`Primitive ${config.type} requires metadata`);
        }
        effectSpec = primitives.drawPath(config.options as PrimitiveMap['drawPath'] & { selector?: string }, config.metadata);
      } else if (config.type === 'staggerFadeIn') {
        if (!config.metadata) {
          throw new Error(`Primitive ${config.type} requires metadata`);
        }
        effectSpec = primitives.staggerFadeIn(config.options as PrimitiveMap['staggerFadeIn'], config.metadata);
      } else {
        // TypeScript should infer this correctly now
        const fn = primitives[config.type];
        effectSpec = (fn as any)(config.options);
      }
      
      // Find target elements
      const targets = ref.current.querySelectorAll(effectSpec.targetSelector);
      
      if (targets.length === 0) {
        logger.warn(`No elements found for selector: ${effectSpec.targetSelector}`);
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
      logger.error('Failed to play animation:', error);
    }
    
    // Cleanup
    return () => {
      animationsRef.current.forEach(anim => anim.cancel());
      animationsRef.current = [];
    };
  }, [ref, configKey]);  // Only depend on ref and serialized config
  
  
  return {
    animations: animationsRef.current,
    play: () => animationsRef.current.forEach(a => a.play()),
    pause: () => animationsRef.current.forEach(a => a.pause()),
    cancel: () => animationsRef.current.forEach(a => a.cancel())
  };
} 