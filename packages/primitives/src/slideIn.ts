import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function slideIn(opts: PrimitiveMap['slideIn']): KeyframeEffectSpec {
  const { fromDirection, distance } = opts;
  
  let translateStart: string;
  
  switch (fromDirection) {
    case 'left':
      translateStart = `translateX(-${distance})`;
      break;
    case 'right':
      translateStart = `translateX(${distance})`;
      break;
    case 'top':
      translateStart = `translateY(-${distance})`;
      break;
    case 'bottom':
      translateStart = `translateY(${distance})`;
      break;
  }
  
  const keyframes = [
    { transform: translateStart, opacity: 0 },
    { transform: 'translate(0, 0)', opacity: 1 }
  ];
  
  return createEffect('svg', keyframes, opts);
} 