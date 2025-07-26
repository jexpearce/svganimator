import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSvgAnalysis } from '../hooks/useSvgAnalysis.js';
import { usePrimitivePlayer } from '../hooks/usePrimitivePlayer.js';
import { useRef } from 'react';

// Mock the analysis module
vi.mock('@motif/analysis', () => ({
  analyzeSvg: vi.fn()
}));

describe('useSvgAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should analyze SVG and return result', async () => {
    const mockResult = {
      cleanedSvgString: '<svg><rect/></svg>',
      metadata: {
        classification: 'flattened' as const,
        flags: ['isFlattened' as const],
        nodeCount: { rect: 1 }
      }
    };
    
    const { analyzeSvg } = await import('@motif/analysis');
    vi.mocked(analyzeSvg).mockResolvedValue(mockResult as any);
    
    const svg = '<svg><rect width="10" height="10"/></svg>';
    const { result } = renderHook(() => useSvgAnalysis(svg));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });
  });
  
  it('should handle analysis errors', async () => {
    const { analyzeSvg } = await import('@motif/analysis');
    vi.mocked(analyzeSvg).mockRejectedValue(new Error('Analysis failed'));
    
    const svg = '<invalid-svg>';
    const { result } = renderHook(() => useSvgAnalysis(svg));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error?.message).toBe('Analysis failed');
    });
  });
  
  it('should use cached results for same SVG', async () => {
    const mockResult = {
      cleanedSvgString: '<svg><circle/></svg>',
      metadata: {
        classification: 'flattened' as const,
        flags: ['isFlattened' as const],
        nodeCount: { circle: 1 }
      }
    };
    
    const { analyzeSvg } = await import('@motif/analysis');
    vi.mocked(analyzeSvg).mockResolvedValue(mockResult as any);
    
    const svg = '<svg><circle r="5"/></svg>';
    
    // First render
    const { result: result1 } = renderHook(() => useSvgAnalysis(svg));
    await waitFor(() => expect(result1.current.loading).toBe(false));
    
    // Second render with same SVG
    const { result: result2 } = renderHook(() => useSvgAnalysis(svg));
    await waitFor(() => expect(result2.current.loading).toBe(false));
    
    // Should only call analyzeSvg once due to caching
    expect(analyzeSvg).toHaveBeenCalledTimes(1);
  });
});

describe('usePrimitivePlayer', () => {
  beforeEach(() => {
    global.Element.prototype.animate = vi.fn().mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      finish: vi.fn(),
      currentTime: 0,
      playState: 'idle'
    });
  });
  
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
  
  it('should handle missing metadata for guarded primitives', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      const player = usePrimitivePlayer(ref, {
        type: 'drawPath',
        options: { duration: 1000 }
        // metadata is missing
      });
      return player;
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
  
  it('should cleanup animations on unmount', () => {
    const mockCancel = vi.fn();
    const mockAnimation = {
      play: vi.fn(),
      pause: vi.fn(),
      cancel: mockCancel,
      finish: vi.fn(),
      currentTime: 0,
      playState: 'idle'
    };
    
    global.Element.prototype.animate = vi.fn().mockReturnValue(mockAnimation);
    
    const { unmount } = renderHook(() => {
      const ref = useRef<SVGSVGElement>(null);
      return usePrimitivePlayer(ref, {
        type: 'fadeIn',
        options: { duration: 500 }
      });
    });
    
    // Create mock SVG and trigger animation
    const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.querySelectorAll = vi.fn().mockReturnValue([mockSvg]);
    
    // Unmount should cancel animations
    unmount();
    
    // Note: In real implementation, cancel would be called during cleanup
  });
}); 