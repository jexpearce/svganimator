/** Classification flags for an analyzed SVG */
export type SvgFlag = 'isFlattened' | 'isStructured' | 'isStrokeBased';

export interface NodeCount {
  path: number;
  g: number;
  [tag: string]: number;
}

export interface SvgAnalysisResult {
  cleanedSvgString: string;
  metadata: {
    classification: 'flattened' | 'structured';
    flags: SvgFlag[];
    nodeCount: NodeCount;
  };
}

/** Generic timing options accepted by *all* primitives */
export interface Timing {
  duration: number; // ms, required
  easing?: string; // CSS easing string, default 'ease'
  delay?: number; // ms, default 0
  fill?: 'none' | 'forwards' | 'both'; // default 'forwards'
}

/** Primitive‑agnostic return value */
export interface KeyframeEffectSpec {
  targetSelector: string;
  keyframes: Keyframe[];
  timing: Timing;
}

/** Map primitive names → their specific option types */
export interface PrimitiveMap {
  fadeIn: Timing & { from?: number; to?: number };
  scale: Timing & { from: number; to: number; origin?: string };
  slideIn: Timing & { fromDirection: 'left' | 'right' | 'top' | 'bottom'; distance: string };
  drawPath: Timing & { stagger?: number };
  staggerFadeIn: Timing & { childSelector: string; stagger: number };
}

/** Custom error for unsupported primitives */
export class UnsupportedPrimitiveError extends Error {
  constructor(primitive: string, reason: string) {
    super(`Primitive "${primitive}" not supported: ${reason}`);
    this.name = 'UnsupportedPrimitiveError';
  }
}

/** SVG AST node type for parsing */
export interface SvgAstNode {
  name: string;
  type: 'element' | 'text';
  value?: string;
  attributes?: Record<string, string>;
  children?: SvgAstNode[];
}

export type SvgAst = SvgAstNode; 