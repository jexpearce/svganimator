import type { PrimitiveMap, KeyframeEffectSpec } from '@motif/schema';
import { createEffect } from './helpers.js';

export function fadeIn(opts: PrimitiveMap['fadeIn']): KeyframeEffectSpec {
  const from = opts.from ?? 0;
  const to = opts.to ?? 1;
  
  const keyframes = [
    { opacity: from },
    { opacity: to }
  ];
  
  return createEffect('svg', keyframes, opts);
} 