import { describe, it, expect } from 'vitest';
import { classifySvg } from '../classify.js';
import type { SvgAst } from '@motif/schema';

describe('classifySvg', () => {
  it('should classify simple flattened SVG', () => {
    const ast: SvgAst = {
      type: 'element',
      tagName: 'svg',
      properties: { width: '100', height: '100' },
      children: [
        {
          type: 'element',
          tagName: 'circle',
          properties: { cx: '50', cy: '50', r: '40', fill: 'blue' }
        }
      ]
    };
    
    const result = classifySvg(ast);
    
    expect(result.classification).toBe('flattened');
    expect(result.flags).toContain('isFlattened');
    expect(result.nodeCount.circle).toBe(1);
  });
  
  it('should classify structured SVG with groups', () => {
    const ast: SvgAst = {
      type: 'element',
      tagName: 'svg',
      properties: { width: '100', height: '100' },
      children: [
        {
          type: 'element',
          tagName: 'g',
          properties: { id: 'group1' },
          children: [
            {
              type: 'element',
              tagName: 'rect',
              properties: { x: '10', y: '10', width: '30', height: '30' }
            },
            {
              type: 'element',
              tagName: 'rect',
              properties: { x: '50', y: '50', width: '30', height: '30' }
            }
          ]
        }
      ]
    };
    
    const result = classifySvg(ast);
    
    expect(result.classification).toBe('structured');
    expect(result.flags).toContain('isStructured');
    expect(result.nodeCount.g).toBe(1);
    expect(result.nodeCount.rect).toBe(2);
  });
  
  it('should detect stroke-based elements', () => {
    const ast: SvgAst = {
      type: 'element',
      tagName: 'svg',
      properties: { width: '100', height: '100' },
      children: [
        {
          type: 'element',
          tagName: 'path',
          properties: {
            d: 'M10,10 L90,90',
            stroke: 'black',
            'stroke-width': '2',
            fill: 'none'
          }
        }
      ]
    };
    
    const result = classifySvg(ast);
    
    expect(result.flags).toContain('isStrokeBased');
  });
  
  it('should not flag elements with both stroke and fill as stroke-based', () => {
    const ast: SvgAst = {
      type: 'element',
      tagName: 'svg',
      properties: { width: '100', height: '100' },
      children: [
        {
          type: 'element',
          tagName: 'rect',
          properties: {
            x: '10',
            y: '10',
            width: '80',
            height: '80',
            stroke: 'black',
            fill: 'red'
          }
        }
      ]
    };
    
    const result = classifySvg(ast);
    
    expect(result.flags).not.toContain('isStrokeBased');
  });
  
  it('should handle text nodes gracefully', () => {
    const ast: SvgAst = {
      type: 'element',
      tagName: 'svg',
      properties: { width: '100', height: '100' },
      children: [
        {
          type: 'element',
          tagName: 'text',
          properties: { x: '50', y: '50' },
          children: [
            {
              type: 'text',
              tagName: '',
              value: 'Hello World'
            }
          ]
        }
      ]
    };
    
    const result = classifySvg(ast);
    
    expect(result.nodeCount.text).toBe(1);
    expect(result.classification).toBe('flattened');
  });
}); 