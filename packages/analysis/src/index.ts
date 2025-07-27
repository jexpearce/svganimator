// SVG processing pipeline for Motif
import type { SvgAnalysisResult } from '@motif/schema';
import { sanitizeSvg } from './sanitize.js';
import { optimizeSvg } from './optimize.js';
import { parseSvg } from './parse.js';
import { classifySvg } from './classify.js';
import { fitSvgToViewBox } from './fitSvg.js';

/**
 * Main analysis pipeline that processes raw SVG into metadata
 */
export async function analyzeSvg(raw: string): Promise<SvgAnalysisResult> {
  // Step 1: Sanitize
  const sanitized = sanitizeSvg(raw);
  const fitted = fitSvgToViewBox(sanitized);

  // Step 2: Parse pre-optimization for accurate counts
  const preAst = parseSvg(fitted);
  const metadata = classifySvg(preAst);

  // Step 3: Optimize for output
  const optimized = await optimizeSvg(fitted);
  return {
    cleanedSvgString: optimized,
    metadata
  };
}

// Re-export individual functions for testing
export { sanitizeSvg, optimizeSvg, parseSvg, classifySvg, fitSvgToViewBox };
