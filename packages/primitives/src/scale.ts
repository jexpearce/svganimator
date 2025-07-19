import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function scale(opts: PrimitiveMap['scale'] & { selector?: string }): KeyframeEffectSpec {
  const { from, to, origin = 'center', selector = 'svg', ...timing } = opts;
  
  // Convert origin to CSS transform-origin value
  const transformOrigin = origin === 'center' ? '50% 50%' : origin;
  
  const keyframes = [
    { 
      transform: `scale(${from})`, 
      'transform-origin': transformOrigin 
    },
    { 
      transform: `scale(${to})`, 
      'transform-origin': transformOrigin 
    }
  ];
  
  return createEffect(selector, keyframes, timing);
} 