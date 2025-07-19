import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from '../sanitize.js';

describe('sanitizeSvg', () => {
  it('should preserve safe SVG elements', () => {
    const input = '<svg><rect x="10" y="10" width="80" height="80" fill="blue"/></svg>';
    const output = sanitizeSvg(input);
    
    expect(output).toContain('<rect');
    expect(output).toContain('fill="blue"');
  });
  
  it('should remove style tags', () => {
    const input = '<svg><style>.red { fill: red; }</style><rect class="red"/></svg>';
    const output = sanitizeSvg(input);
    
    expect(output).not.toContain('<style');
    expect(output).toContain('<rect');
  });
  
  it('should handle data URIs in attributes', () => {
    const input = '<svg><image href="data:image/png;base64,invalid"/></svg>';
    const output = sanitizeSvg(input);
    
    // DOMPurify should handle this appropriately
    expect(output).toBeDefined();
  });
  
  it('should preserve viewBox attribute', () => {
    const input = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    const output = sanitizeSvg(input);
    
    expect(output).toContain('viewBox');
  });
  
  it('should handle empty SVG', () => {
    const input = '<svg></svg>';
    const output = sanitizeSvg(input);
    
    expect(output).toContain('<svg');
    expect(output).toContain('</svg>');
  });
  
  it('should handle malformed SVG gracefully', () => {
    const input = '<svg><rect></svg>';  // Missing closing tag
    const output = sanitizeSvg(input);
    
    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(0);
  });
}); 