import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function slideIn(opts: PrimitiveMap['slideIn'] & { selector?: string }): KeyframeEffectSpec {
  const { fromDirection, distance, selector = 'svg', ...timing } = opts;
  
  let translateStart = '';
  let translateEnd = '';
  
  switch (fromDirection) {
    case 'left':
      translateStart = `translateX(-${distance})`;
      translateEnd = 'translateX(0)';
      break;
    case 'right':
      translateStart = `translateX(${distance})`;
      translateEnd = 'translateX(0)';
      break;
    case 'top':
      translateStart = `translateY(-${distance})`;
      translateEnd = 'translateY(0)';
      break;
    case 'bottom': {
      translateStart = `translateY(${distance})`;
      translateEnd = 'translateY(0)';
      break;
    }
    default: {
      const _exhaustive: never = fromDirection;
      throw new Error(`Unknown direction: ${_exhaustive}`);
    }
  }
  
  const keyframes = [
    { transform: translateStart, opacity: 0 },
    { transform: translateEnd, opacity: 1 }
  ];
  
  return createEffect(selector, keyframes, timing);
} 