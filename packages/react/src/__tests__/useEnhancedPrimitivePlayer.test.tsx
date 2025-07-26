import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useEnhancedPrimitivePlayer } from '../hooks/useEnhancedPrimitivePlayer.js';

// Mock the primitives and runtime functions
vi.mock('@motif/primitives', () => ({
  primitives: {
    fadeIn: vi.fn(() => ({
      targetSelector: 'svg',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      timing: { duration: 1000, delay: 0 }
    })),
    drawPath: vi.fn(() => ({
      targetSelector: 'path',
      keyframes: [{ strokeDasharray: '100 100', strokeDashoffset: 100 }, { strokeDashoffset: 0 }],
      timing: { duration: 2000, delay: 0 }
    })),
    staggerFadeIn: vi.fn(() => ({
      targetSelector: 'g > *',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      timing: { duration: 500, delay: 0 }
    }))
  },
  enhanceDrawPathEffect: vi.fn(() => null) // Return null to test fallback
}));

describe('useEnhancedPrimitivePlayer', () => {
  let mockSvgElement: SVGSVGElement;
  let mockPathElement: SVGPathElement;
  let mockAnimation: Animation;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock SVG elements with proper instanceof checks
    mockPathElement = {
      animate: vi.fn(),
      constructor: { name: 'SVGPathElement' }
    } as any;
    Object.setPrototypeOf(mockPathElement, SVGElement.prototype);
    
    mockSvgElement = {
      querySelectorAll: vi.fn(),
      animate: vi.fn()
    } as any;
    
    // Mock Animation
    mockAnimation = {
      play: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      startTime: 0
    } as any;
    
    global.Animation = vi.fn().mockImplementation(() => mockAnimation);
    Object.defineProperty(document, 'timeline', {
      value: { currentTime: 0 },
      writable: true
    });
    
    // Setup default query selector behavior - return the element itself for 'svg' selector
    vi.mocked(mockSvgElement.querySelectorAll).mockImplementation((selector: string) => {
      if (selector === 'svg') return [mockSvgElement] as any;
      if (selector === 'path') return [mockPathElement] as any;
      if (selector === 'g > *') return [mockPathElement, mockPathElement] as any;
      return [] as any;
    });
    vi.mocked(mockPathElement.animate).mockReturnValue(mockAnimation);
    vi.mocked(mockSvgElement.animate).mockReturnValue(mockAnimation);
  });

  it('should handle null config', () => {
    const { result } = renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, null);
    });

    expect(result.current.animations).toEqual([]);
  });

  it('should handle fadeIn animation', () => {
    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'fadeIn',
        options: { duration: 1000, from: 0, to: 1 }
      });
    });

    expect(mockSvgElement.animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 1000, delay: 0 }
    );
  });

  it('should handle drawPath with metadata', () => {
    const metadata = {
      classification: 'structured' as const,
      flags: ['isStrokeBased' as const],
      nodeCount: { path: 2 }
    };

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'drawPath',
        options: { duration: 2000, stagger: 100 },
        metadata
      });
    });

    expect(mockPathElement.animate).toHaveBeenCalled();
  });

  it('should handle drawPath without metadata (should throw)', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'drawPath',
        options: { duration: 2000 }
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to play animation:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle staggerFadeIn with metadata', () => {
    const metadata = {
      classification: 'structured' as const,
      flags: ['isStructured' as const],
      nodeCount: { g: 1 }
    };

    const mockChildren = [
      { animate: vi.fn().mockReturnValue(mockAnimation) },
      { animate: vi.fn().mockReturnValue(mockAnimation) }
    ];
    vi.mocked(mockSvgElement.querySelectorAll).mockReturnValue(mockChildren as any);

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
             return useEnhancedPrimitivePlayer(ref, {
         type: 'staggerFadeIn',
         options: { duration: 500, childSelector: 'g > *', stagger: 100 },
         metadata
       });
    });

    // Should animate each child with staggered delay
    expect(mockChildren[0].animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 500, delay: 0 }
    );
    expect(mockChildren[1].animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 500, delay: 100 }
    );
  });

  it('should provide player controls', () => {
    const { result } = renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'fadeIn',
        options: { duration: 1000 }
      });
    });

    // Test player controls
    result.current.play();
    expect(mockAnimation.play).toHaveBeenCalled();

    result.current.pause();
    expect(mockAnimation.pause).toHaveBeenCalled();

    result.current.cancel();
    expect(mockAnimation.cancel).toHaveBeenCalled();
  });

  it('should clean up animations on config change', () => {
    const { rerender } = renderHook(
      ({ config }) => {
        const ref = useRef<SVGSVGElement>(mockSvgElement);
        return useEnhancedPrimitivePlayer(ref, config);
      },
      {
        initialProps: {
          config: { type: 'fadeIn' as const, options: { duration: 1000 } }
        }
      }
    );

    // Change config
    rerender({
      config: { type: 'fadeIn' as const, options: { duration: 2000 } }
    });

    // Should cancel previous animations
    expect(mockAnimation.cancel).toHaveBeenCalled();
  });

  it('should handle unknown primitive type', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'unknownType' as any,
        options: {}
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to play animation:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should warn when no targets found', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(mockSvgElement.querySelectorAll).mockImplementation(() => [] as any);

    renderHook(() => {
      const ref = useRef<SVGSVGElement>(mockSvgElement);
      return useEnhancedPrimitivePlayer(ref, {
        type: 'fadeIn',
        options: { duration: 1000 }
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('No elements found for selector: svg');
    consoleSpy.mockRestore();
  });
}); 