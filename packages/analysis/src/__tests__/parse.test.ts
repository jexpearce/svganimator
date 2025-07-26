import { describe, it, expect } from 'vitest';
import { parseSvg } from '../parse.js';

describe('parseSvg', () => {
  it('should parse simple SVG', () => {
    const svg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
    const ast = parseSvg(svg);
    
    expect(ast.tagName).toBe('svg');
    expect(ast.type).toBe('element');
    expect(ast.properties?.width).toBe(100);
    expect(ast.children).toHaveLength(1);
    expect(ast.children?.[0].tagName).toBe('circle');
  });
  
  it('should throw error for non-SVG root', () => {
    const notSvg = '<div>Not an SVG</div>';
    
    expect(() => parseSvg(notSvg)).toThrow('root element is not <svg>');
  });
  
  it('should throw error for empty input', () => {
    expect(() => parseSvg('')).toThrow('no root element found');
  });
  
  it('should parse nested elements', () => {
    const svg = `
      <svg>
        <g id="group1">
          <rect x="10" y="10" width="30" height="30"/>
          <circle cx="50" cy="50" r="20"/>
        </g>
      </svg>
    `;
    
    const ast = parseSvg(svg);
    
    expect(ast.children?.[0].tagName).toBe('g');
    expect(ast.children?.[0].children).toHaveLength(2);
  });
  
  it('should preserve attributes', () => {
    const svg = '<svg><path d="M10,10 L90,90" stroke="black" stroke-width="2"/></svg>';
    const ast = parseSvg(svg);
    
    const path = ast.children?.[0];
    expect(path?.properties?.d).toBe('M10,10 L90,90');
    expect(path?.properties?.stroke).toBe('black');
    expect(path?.properties?.['stroke-width']).toBe(2);
  });
}); 