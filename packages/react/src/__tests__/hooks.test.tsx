import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSvgAnalysis } from '../hooks/useSvgAnalysis.js';
import { usePrimitivePlayer } from '../hooks/usePrimitivePlayer.js';
import { useRef } from 'react';

describe('useSvgAnalysis', () => {
  it('should analyze SVG and return result', async () => {
    const svg = '<svg><rect width="10" height="10"/></svg>';
    const { result } = renderHook(() => useSvgAnalysis(svg));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeTruthy();
      expect(result.current.data?.metadata.nodeCount.rect).toBe(1);
    });
  });
  
  it('should memoize by content', async () => {
    const svg = '<svg><circle r="5"/></svg>';
    const { result, rerender } = renderHook(
      ({ svgString }) => useSvgAnalysis(svgString),
      { initialProps: { svgString: svg } }
    );
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const firstResult = result.current.data;
    
    // Rerender with same content
    rerender({ svgString: svg });
    
    expect(result.current.data).toBe(firstResult);
  });
});

describe('usePrimitivePlayer', () => {
  it('should create animations when config provided', () => {
    const { result } = renderHook(() => {
      const ref = useRef<SVGSVGElement>(null);
      const player = usePrimitivePlayer(ref, {
        type: 'fadeIn',
        options: { duration: 500 }
      });
      return { ref, player };
    });
    
    // Mock SVG element
    const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.querySelectorAll = vi.fn().mockReturnValue([mockSvg]);
    (result.current.ref as any).current = mockSvg;
    
    // Trigger effect
    const { rerender } = renderHook(() => 
      usePrimitivePlayer(result.current.ref, {
        type: 'fadeIn',
        options: { duration: 500 }
      })
    );
    
    rerender();
    
    expect(mockSvg.animate).toHaveBeenCalled();
  });
}); 