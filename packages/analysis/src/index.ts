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
  
  // Step 2: Optimize
  const optimized = await optimizeSvg(sanitized);
  
  // Step 3: Parse
  const ast = parseSvg(optimized);
  
  // Step 4: Classify
  const metadata = classifySvg(ast);
  
  return {
    cleanedSvgString: optimized,
    metadata
  };
}

// Re-export individual functions for testing
export { sanitizeSvg, optimizeSvg, parseSvg, classifySvg }; 