import { fadeIn } from './fadeIn.js';
import { scale } from './scale.js';
import { slideIn } from './slideIn.js';
import { drawPath } from './drawPath.js';
import { staggerFadeIn } from './staggerFadeIn.js';
import type { PrimitiveMap, KeyframeEffectSpec, SvgAnalysisResult, Timing } from '@motif/schema';

// Type-safe primitive functions
export type PrimitiveFunctions = {
  fadeIn: typeof fadeIn;
  scale: typeof scale;
  slideIn: typeof slideIn;
  drawPath: (opts: PrimitiveMap['drawPath'] & { selector?: string }, metadata: SvgAnalysisResult['metadata']) => KeyframeEffectSpec;
  staggerFadeIn: (opts: PrimitiveMap['staggerFadeIn'], metadata: SvgAnalysisResult['metadata']) => KeyframeEffectSpec;
};

export const primitives: PrimitiveFunctions = {
  fadeIn,
  scale,
  slideIn,
  drawPath,
  staggerFadeIn
};

// Individual exports
export { fadeIn, scale, slideIn, drawPath, staggerFadeIn };
export { createEffect } from './helpers.js';

// Runtime helpers
export { enhanceDrawPathEffect, getCachedPathLength } from './runtime/drawPath.js';
export type { DrawPathRuntime } from './runtime/drawPath.js';

// Re-export types for convenience
export type { KeyframeEffectSpec, PrimitiveMap, Timing } from '@motif/schema'; 