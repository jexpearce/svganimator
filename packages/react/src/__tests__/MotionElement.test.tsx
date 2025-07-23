import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { MotionElement, MotionHandle } from '../components/MotionElement.js';

// Mock Web Animations API
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

describe('MotionElement', () => {
  const simpleSvg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';
  
  it('should render SVG content', async () => {
    const ref = React.createRef<MotionHandle>();
    const { container } = render(<MotionElement ref={ref} svgString={simpleSvg} />);
    
    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.querySelector('circle')).toBeTruthy();
    });
  });
  
  it('should show loading state', () => {
    const ref = React.createRef<MotionHandle>();
    render(<MotionElement ref={ref} svgString={simpleSvg} />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });
  
  it('should apply animation when config provided', async () => {
    const animationConfig = {
      type: 'fadeIn' as const,
      options: { duration: 1000 }
    };
    
    const ref = React.createRef<MotionHandle>();
    render(
      <MotionElement
        ref={ref}
        svgString={simpleSvg}
        animationConfig={animationConfig}
      />
    );
    
    await waitFor(() => {
      expect(global.Element.prototype.animate).toHaveBeenCalled();
    });
  });
  
  it('should handle errors gracefully', async () => {
    const invalidSvg = 'not valid svg';
    
    const ref = React.createRef<MotionHandle>();
    render(<MotionElement ref={ref} svgString={invalidSvg} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeTruthy();
    });
  });
}); 