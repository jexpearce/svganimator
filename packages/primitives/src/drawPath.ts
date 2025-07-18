import type { PrimitiveMap, KeyframeEffectSpec, SvgAnalysisResult } from '@motif/schema';
import { UnsupportedPrimitiveError } from '@motif/schema';
import { createEffect } from './helpers.js';

export function drawPath(
  opts: PrimitiveMap['drawPath'],
  metadata?: SvgAnalysisResult['metadata']
): KeyframeEffectSpec {
  // Guard: Check if SVG is stroke-based
  if (metadata && !metadata.flags.includes('isStrokeBased')) {
    throw new UnsupportedPrimitiveError(
      'drawPath',
      'SVG must contain stroke-based elements'
    );
  }
  
  // For path drawing, we animate strokeDasharray and strokeDashoffset
  // This creates the "drawing" effect
  const keyframes = [
    {
      strokeDasharray: '1000',
      strokeDashoffset: '1000'
    },
    {
      strokeDasharray: '1000',
      strokeDashoffset: '0'
    }
  ];
  
  // Target all paths and shapes with strokes
  const selector = 'path[stroke], circle[stroke], rect[stroke], line[stroke], polyline[stroke], polygon[stroke]';
  
  return createEffect(selector, keyframes, opts);
} 