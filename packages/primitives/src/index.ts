// Animation primitive generators for Motif
import type { KeyframeEffectSpec, PrimitiveMap } from '@motif/schema';

export function fadeIn(options: PrimitiveMap['fadeIn']): KeyframeEffectSpec {
  return {
    targetSelector: 'svg',
    keyframes: [
      { opacity: options.from ?? 0 },
      { opacity: options.to ?? 1 }
    ],
    timing: {
      duration: options.duration,
      easing: options.easing ?? 'ease',
      delay: options.delay ?? 0,
      fill: options.fill ?? 'forwards'
    }
  };
}

export function scale(options: PrimitiveMap['scale']): KeyframeEffectSpec {
  return {
    targetSelector: 'svg',
    keyframes: [
      { transform: `scale(${options.from})` },
      { transform: `scale(${options.to})` }
    ],
    timing: {
      duration: options.duration,
      easing: options.easing ?? 'ease',
      delay: options.delay ?? 0,
      fill: options.fill ?? 'forwards'
    }
  };
} 