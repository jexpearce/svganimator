import type { PrimitiveMap, KeyframeEffectSpec, SvgAnalysisResult } from '@motif/schema';
import { UnsupportedPrimitiveError } from '@motif/schema';
import { createEffect } from './helpers.js';

export function staggerFadeIn(
  opts: PrimitiveMap['staggerFadeIn'],
  metadata?: SvgAnalysisResult['metadata']
): KeyframeEffectSpec {
  // Guard: Check if SVG is structured
  if (metadata && metadata.classification !== 'structured') {
    throw new UnsupportedPrimitiveError(
      'staggerFadeIn',
      'SVG must have a structured layout with groups'
    );
  }
  
  const { childSelector, stagger } = opts;
  
  // For stagger, we'll return a spec that targets the children
  // In a real implementation, this would be handled by the runtime
  // to apply delays to each child element
  const keyframes = [
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ];
  
  // Note: The actual staggering would be implemented in the runtime
  // by applying incremental delays to each matching element
  return createEffect(childSelector, keyframes, {
    ...opts,
    // Stagger info would be used by the runtime
  });
} 