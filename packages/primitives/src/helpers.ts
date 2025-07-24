import type { Timing, KeyframeEffectSpec } from '@motif/schema';

/**
 * Creates a KeyframeEffectSpec with validation
 */
export function createEffect(
  selector: string,
  frames: Keyframe[],
  timing: Timing
): KeyframeEffectSpec {
  // Apply defaults to timing
  const normalizedTiming: Timing = {
    duration: timing.duration,
    easing: timing.easing || 'ease',
    delay: timing.delay || 0,
    fill: timing.fill || 'forwards'
  };
  
  // Validate required fields
  if (!selector) {
    throw new Error('Target selector is required');
  }
  
  if (!frames || frames.length === 0) {
    throw new Error('At least one keyframe is required');
  }
  
  if (typeof normalizedTiming.duration !== 'number' || normalizedTiming.duration <= 0) {
    throw new Error('Duration must be a positive number');
  }
  
  return {
    targetSelector: selector,
    keyframes: frames,
    timing: normalizedTiming
  };
}

/**
 * Generates staggered delay for child elements
 */
export function calculateStagger(index: number, staggerMs: number, baseDelay: number = 0): number {
  return baseDelay + (index * staggerMs);
} 