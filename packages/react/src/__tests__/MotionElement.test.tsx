import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MotionElement, type MotionHandle } from '../components/MotionElement.js';

// Mock the analysis module
vi.mock('@motif/analysis', () => ({
  analyzeSvg: vi.fn()
}));

// Mock the enhanced primitive player
vi.mock('../hooks/useEnhancedPrimitivePlayer.js', () => ({
  useEnhancedPrimitivePlayer: vi.fn(() => ({
    animations: [],
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn()
  }))
}));

describe('MotionElement', () => {
  const simpleSvg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default loading state', () => {
    render(<MotionElement svgString={simpleSvg} />);
    expect(screen.getByText('Loading…')).toBeTruthy();
  });
  
     it('should call enhanced primitive player when config provided', async () => {
     const animationConfig = {
       type: 'fadeIn' as const,
       options: { duration: 1000 }
     };

     const { useEnhancedPrimitivePlayer } = await import('../hooks/useEnhancedPrimitivePlayer.js');
     const mockPlayer = vi.mocked(useEnhancedPrimitivePlayer);
     
     const ref = React.createRef<MotionHandle>();
     render(
       <MotionElement
         ref={ref}
         svgString={simpleSvg}
         animationConfig={animationConfig}
       />
     );
     
     // Test that the enhanced primitive player hook is called (integration test)
     await waitFor(() => {
       expect(mockPlayer).toHaveBeenCalled();
     });
     
     // Verify it was called with correct structure
     const calls = mockPlayer.mock.calls;
     expect(calls.length).toBeGreaterThan(0);
     expect(calls[0][0]).toHaveProperty('current'); // Verify ref structure
   });
  
  it('should handle errors gracefully', async () => {
    const invalidSvg = 'not valid svg';
    
    const { analyzeSvg } = await import('@motif/analysis');
    vi.mocked(analyzeSvg).mockRejectedValue(new Error('Invalid SVG'));
    
    render(<MotionElement svgString={invalidSvg} />);
    
    // Should still render without crashing
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('should expose imperative handle methods', () => {
    const ref = React.createRef<MotionHandle>();
    
    render(
      <MotionElement
        ref={ref}
        svgString={simpleSvg}
        animationConfig={{
          type: 'fadeIn',
          options: { duration: 1000 }
        }}
      />
    );
    
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.play).toBe('function');
    expect(typeof ref.current?.pause).toBe('function');
    expect(typeof ref.current?.cancel).toBe('function');
  });
}); 