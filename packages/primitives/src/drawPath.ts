import type { PrimitiveMap, KeyframeEffectSpec, SvgAnalysisResult } from '@motif/schema';
import { UnsupportedPrimitiveError } from '@motif/schema';
import { createEffect } from './helpers.js';

export function drawPath(
  opts: PrimitiveMap['drawPath'] & { selector?: string },
  metadata: SvgAnalysisResult['metadata']
): KeyframeEffectSpec {
  // Guard: Check if SVG is stroke-based
  if (!metadata.flags.includes('isStrokeBased')) {
    throw new UnsupportedPrimitiveError(
      'drawPath',
      'SVG must contain stroke-based elements'
    );
  }
  
  const { selector = 'path[stroke], circle[stroke], rect[stroke], line[stroke], polyline[stroke], polygon[stroke]', ...timing } = opts;
  
  // For path drawing, we animate strokeDasharray and strokeDashoffset
  // This creates the "drawing" effect
  // Note: In a real implementation, we'd compute path.getTotalLength() at runtime
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
  
  return createEffect(selector, keyframes, timing);
} 