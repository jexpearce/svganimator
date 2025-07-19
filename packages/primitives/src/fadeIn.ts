import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function fadeIn(opts: PrimitiveMap['fadeIn'] & { selector?: string }): KeyframeEffectSpec {
  const { from = 0, to = 1, selector = 'svg', ...timing } = opts;
  
  const keyframes = [
    { opacity: from },
    { opacity: to }
  ];
  
  return createEffect(selector, keyframes, timing);
} 