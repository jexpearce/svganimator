import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function scale(opts: PrimitiveMap['scale']): KeyframeEffectSpec {
  const { from, to, origin = 'center' } = opts;
  
  // Convert origin to CSS transform-origin value
  const transformOrigin = origin === 'center' ? '50% 50%' : origin;
  
  const keyframes = [
    { transform: `scale(${from})`, transformOrigin },
    { transform: `scale(${to})`, transformOrigin }
  ];
  
  return createEffect('svg', keyframes, opts);
} 