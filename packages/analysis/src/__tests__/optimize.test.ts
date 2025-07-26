import { describe, it, expect } from 'vitest';
import { optimizeSvg } from '../optimize.js';

describe('optimizeSvg', () => {
  it('should optimize simple SVG', async () => {
    const input = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10.000" y="10.000" width="80.000" height="80.000" fill="#ff0000"/>
      </svg>
    `;
    
    const output = await optimizeSvg(input);
    
    // Check that numbers are optimized
    expect(output).toContain('x="10"');
    expect(output).toContain('y="10"');
    expect(output).not.toContain('.000');
    
    // Color names should not be used
    expect(output).toContain('#ff0000');
  });
  
  it('should preserve viewBox', async () => {
    const input = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    const output = await optimizeSvg(input);

    expect(output).toContain('viewBox');
  });

  it('should retain group elements', async () => {
    const input = `
      <svg width="100" height="100">
        <g id="layer1">
          <rect x="10" y="10" width="80" height="80" fill="red"/>
        </g>
      </svg>
    `;

    const output = await optimizeSvg(input);

    expect(output).toContain('<g');
  });
  
  it('should handle empty SVG', async () => {
    const input = '<svg></svg>';
    const output = await optimizeSvg(input);
    
    expect(output).toContain('<svg');
  });
  
  it('should remove unnecessary attributes', async () => {
    const input = `
      <svg width="100" height="100" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect x="0" y="0" width="100" height="100" fill="red"/>
      </svg>
    `;
    
    const output = await optimizeSvg(input);
    
    // SVGO should remove version and unused namespaces
    expect(output).not.toContain('version=');
    expect(output).not.toContain('xmlns:xlink');
  });
}); 