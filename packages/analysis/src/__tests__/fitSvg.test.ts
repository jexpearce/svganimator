import { describe, it, expect } from 'vitest';
import { fitSvgToViewBox } from '../fitSvg.js';

describe('fitSvgToViewBox', () => {
  it('shrinks large SVG to viewport', () => {
    const input = '<svg width="4000" height="4000"><rect width="4000" height="4000"/></svg>';
    const output = fitSvgToViewBox(input, 200);
    expect(output).toContain('viewBox="0 0 4000 4000"');
    expect(output).toContain('style="max-width:200px; max-height:200px"');
    const rootTag = output.slice(0, output.indexOf('>'));
    expect(rootTag).not.toContain('width="');
    expect(rootTag).not.toContain('height="');
  });

  it('scales small SVG up', () => {
    const input = '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10"/></svg>';
    const output = fitSvgToViewBox(input, 200);
    expect(output).toContain('viewBox="0 0 20 20"');
    expect(output).toContain('style="max-width:200px; max-height:200px"');
    const rootTag = output.slice(0, output.indexOf('>'));
    expect(rootTag).not.toContain('width="');
    expect(rootTag).not.toContain('height="');
  });
});
