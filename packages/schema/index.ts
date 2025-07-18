// Shared TypeScript types and interfaces for Motif
export interface AnimationConfig {
  type: string;
  options: Record<string, any>;
}

export interface SVGElement {
  tagName: string;
  attributes: Record<string, string>;
  children?: SVGElement[];
} 