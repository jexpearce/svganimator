import { parse } from 'svg-parser';
import type { SvgAst } from '@motif/schema';

/**
 * Parses clean SVG string into AST
 */
export function parseSvg(clean: string): SvgAst {
  if (!clean || clean.trim() === '') {
    throw new Error('no root element found');
  }
  
  const parsed = parse(clean);
  
  if (!parsed || !parsed.children || parsed.children.length === 0) {
    throw new Error('no root element found');
  }

  const svgElement = parsed.children.find(
    (child) => child.type === 'element' && child.tagName === 'svg'
  );
  
  if (!svgElement) {
    throw new Error('root element is not <svg>');
  }

  return svgElement as SvgAst;
}