// SVG processing pipeline for Motif
import type { SvgAnalysisResult } from '@motif/schema';
import { sanitizeSvg } from './sanitize.js';
import { optimizeSvg } from './optimize.js';
import { parseSvg } from './parse.js';
import { classifySvg } from './classify.js';

/**
 * Main analysis pipeline that processes raw SVG into metadata
 */
export async function analyzeSvg(raw: string): Promise<SvgAnalysisResult> {
  // Step 1: Sanitize
  const sanitized = sanitizeSvg(raw);

  // Step 2: Parse pre-optimization for accurate counts
  const preAst = parseSvg(sanitized);
  const metadata = classifySvg(preAst);

  // Step 3: Optimize for output
  const optimized = await optimizeSvg(sanitized);
  return {
    cleanedSvgString: optimized,
    metadata
  };
}

// Re-export individual functions for testing
export { sanitizeSvg, optimizeSvg, parseSvg, classifySvg }; 