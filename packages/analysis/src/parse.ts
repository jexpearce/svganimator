import { parse } from 'svg-parser';
import type { SvgAst } from '@motif/schema';

/**
 * Parses clean SVG string into AST
 */
export function parseSvg(clean: string): SvgAst {
  const parsed = parse(clean);
  
  if (!parsed || !parsed.children || parsed.children.length === 0) {
    throw new Error('Failed to parse SVG: no root element found');
  }
  
  // svg-parser returns a root with children array, we want the first child (svg element)
  const svgElement = parsed.children[0];
  if (!svgElement || svgElement.name !== 'svg') {
    throw new Error('Failed to parse SVG: root element is not <svg>');
  }
  
  return svgElement as SvgAst;
} 