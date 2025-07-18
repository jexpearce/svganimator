import { describe, it, expect } from 'vitest';
import { analyzeSvg, sanitizeSvg } from '../index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fc from 'fast-check';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('SVG Analysis Pipeline', () => {
  describe('analyzeSvg', () => {
    it('should process a simple SVG', async () => {
      const svg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';
      const result = await analyzeSvg(svg);
      
      expect(result.cleanedSvgString).toContain('circle');
      expect(result.metadata.classification).toBe('flattened');
      expect(result.metadata.nodeCount.circle).toBe(1);
    });
    
    it('should detect structured SVGs', async () => {
      const svg = `
        <svg width="100" height="100">
          <g id="group1">
            <rect x="10" y="10" width="30" height="30" fill="red"/>
            <rect x="50" y="50" width="30" height="30" fill="blue"/>
          </g>
        </svg>
      `;
      const result = await analyzeSvg(svg);
      
      expect(result.metadata.classification).toBe('structured');
      expect(result.metadata.flags).toContain('isStructured');
      expect(result.metadata.nodeCount.g).toBe(1);
      expect(result.metadata.nodeCount.rect).toBe(2);
    });
    
    it('should detect stroke-based SVGs', async () => {
      const svg = `
        <svg width="100" height="100">
          <path d="M10,10 L90,90" stroke="black" stroke-width="2" fill="none"/>
        </svg>
      `;
      const result = await analyzeSvg(svg);
      
      expect(result.metadata.flags).toContain('isStrokeBased');
    });
  });
  
  describe('sanitizeSvg', () => {
    it('should remove malicious scripts', () => {
      const malicious = '<svg><script>alert("xss")</script><circle r="10"/></svg>';
      const clean = sanitizeSvg(malicious);
      
      expect(clean).not.toContain('script');
      expect(clean).toContain('circle');
    });
    
    it('should remove event handlers', () => {
      const malicious = '<svg><rect onclick="alert(\'xss\')" width="10" height="10"/></svg>';
      const clean = sanitizeSvg(malicious);
      
      expect(clean).not.toContain('onclick');
      expect(clean).toContain('rect');
    });
  });
  
  describe('Property-based tests', () => {
    it('should handle random SVG structures without crashing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              tag: fc.constantFrom('rect', 'circle', 'path', 'g'),
              attrs: fc.dictionary(
                fc.constantFrom('x', 'y', 'width', 'height', 'r', 'd', 'fill', 'stroke'),
                fc.string()
              )
            }),
            { maxLength: 10 }
          ),
          async (elements) => {
            const svgContent = elements
              .map(el => {
                const attrs = Object.entries(el.attrs)
                  .map(([k, v]) => `${k}="${v}"`)
                  .join(' ');
                return `<${el.tag} ${attrs}/>`;
              })
              .join('');
            
            const svg = `<svg width="100" height="100">${svgContent}</svg>`;
            
            // Should not throw
            const result = await analyzeSvg(svg);
            expect(result).toBeDefined();
            expect(result.cleanedSvgString).toBeDefined();
            expect(result.metadata).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
}); 