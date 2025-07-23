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

  // svg-parser wraps the real root <svg> element in a document node. Locate the
  // first child element named 'svg' rather than assuming index 0.
  const svgElement = parsed.children.find(
    (c: any) => c.type === 'element' && c.name === 'svg'
  );
  if (!svgElement) {
    throw new Error('Failed to parse SVG: root element is not <svg>');
  }

  return svgElement as SvgAst;
}