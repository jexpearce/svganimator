import { useEffect, useRef, RefObject } from 'react';
import * as primitives from '@motif/primitives';
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
  
  useEffect(() => {
    if (!ref.current || !config) return;
    
    // Clean up previous animations
    animationsRef.current.forEach(anim => anim.cancel());
    animationsRef.current = [];
    
    try {
      // Get the primitive function
      const primitiveFn = primitives[config.type] as any;
      if (!primitiveFn) {
        throw new Error(`Unknown primitive: ${config.type}`);
      }
      
      // Generate the effect spec
      const effectSpec: KeyframeEffectSpec = 
        config.metadata && (config.type === 'drawPath' || config.type === 'staggerFadeIn')
          ? primitiveFn(config.options, config.metadata)
          : primitiveFn(config.options);
      
      // Find target elements
      const targets = ref.current.querySelectorAll(effectSpec.targetSelector);
      
      if (targets.length === 0) {
        console.warn(`No elements found for selector: ${effectSpec.targetSelector}`);
        return;
      }
      
      // Handle staggering if needed
      const isStagger = config.type === 'staggerFadeIn';
      const staggerDelay = isStagger ? (config.options as any).stagger : 0;
      
      // Create animations for each target
      targets.forEach((target, index) => {
        const timing = {
          ...effectSpec.timing,
          delay: effectSpec.timing.delay + (isStagger ? index * staggerDelay : 0)
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
  }, [ref, config]);
  
  return {
    animations: animationsRef.current,
    play: () => animationsRef.current.forEach(a => a.play()),
    pause: () => animationsRef.current.forEach(a => a.pause()),
    cancel: () => animationsRef.current.forEach(a => a.cancel())
  };
} 