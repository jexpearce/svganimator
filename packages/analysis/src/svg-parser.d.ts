declare module 'svg-parser' {
  export interface SvgNode {
    type: 'element' | 'text';
    tagName: string;
    properties?: Record<string, string>;
    children?: SvgNode[];
  }

  export function parse(svg: string): SvgNode;
} 