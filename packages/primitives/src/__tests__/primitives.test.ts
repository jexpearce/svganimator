import { describe, it, expect } from 'vitest';
import { fadeIn, scale, slideIn, drawPath, staggerFadeIn } from '../index.js';
import { UnsupportedPrimitiveError } from '@motif/schema';

describe('Animation Primitives', () => {
  describe('fadeIn', () => {
    it('should create fadeIn effect with defaults', () => {
      const effect = fadeIn({ duration: 1000 });
      
      expect(effect.targetSelector).toBe('svg');
      expect(effect.keyframes).toHaveLength(2);
      expect(effect.keyframes[0]).toEqual({ opacity: 0 });
      expect(effect.keyframes[1]).toEqual({ opacity: 1 });
      expect(effect.timing.duration).toBe(1000);
      expect(effect.timing.easing).toBe('ease');
    });
    
    it('should accept custom from/to values', () => {
      const effect = fadeIn({ duration: 500, from: 0.5, to: 0.8 });
      
      expect(effect.keyframes[0]).toEqual({ opacity: 0.5 });
      expect(effect.keyframes[1]).toEqual({ opacity: 0.8 });
    });
    
    it('should accept custom selector', () => {
      const effect = fadeIn({ duration: 500, selector: '.fade-target' });
      expect(effect.targetSelector).toBe('.fade-target');
    });
  });
  
  describe('scale', () => {
    it('should create scale effect', () => {
      const effect = scale({ duration: 800, from: 0.5, to: 1 });
      
      expect(effect.targetSelector).toBe('svg');
      expect(effect.keyframes[0].transform).toBe('scale(0.5)');
      expect(effect.keyframes[1].transform).toBe('scale(1)');
    });
    
    it('should handle custom transform origin', () => {
      const effect = scale({ duration: 800, from: 0, to: 1, origin: 'top left' });
      
      expect(effect.keyframes[0]['transform-origin']).toBe('top left');
    });
  });
  
  describe('slideIn', () => {
    it('should create slide effect from left', () => {
      const effect = slideIn({ duration: 600, fromDirection: 'left', distance: '100px' });
      
      expect(effect.keyframes[0].transform).toBe('translateX(-100px)');
      expect(effect.keyframes[1].transform).toBe('translateX(0)');
    });
    
    it('should create slide effect from right', () => {
      const effect = slideIn({ duration: 600, fromDirection: 'right', distance: '50px' });
      
      expect(effect.keyframes[0].transform).toBe('translateX(50px)');
      expect(effect.keyframes[1].transform).toBe('translateX(0)');
    });
    
    it('should create slide effect from top', () => {
      const effect = slideIn({ duration: 600, fromDirection: 'top', distance: '75px' });
      
      expect(effect.keyframes[0].transform).toBe('translateY(-75px)');
      expect(effect.keyframes[1].transform).toBe('translateY(0)');
    });
    
    it('should create slide effect from bottom', () => {
      const effect = slideIn({ duration: 600, fromDirection: 'bottom', distance: '25px' });
      
      expect(effect.keyframes[0].transform).toBe('translateY(25px)');
      expect(effect.keyframes[1].transform).toBe('translateY(0)');
    });
    
    it('should handle all directions', () => {
      const directions = ['left', 'right', 'top', 'bottom'] as const;
      
      directions.forEach(dir => {
        const effect = slideIn({ duration: 600, fromDirection: dir, distance: '50px' });
        expect(effect.keyframes).toHaveLength(2);
      });
    });
  });
  
  describe('drawPath', () => {
    const strokeMetadata = {
      classification: 'flattened' as const,
      flags: ['isFlattened', 'isStrokeBased'] as any,
      nodeCount: { path: 1, g: 0 }
    };
    
    it('should create path drawing effect', () => {
      const effect = drawPath({ duration: 2000 }, strokeMetadata);
      
      expect(effect.targetSelector).toContain('path[stroke]');
      expect(effect.keyframes[0].strokeDashoffset).toBe('1000');
      expect(effect.keyframes[1].strokeDashoffset).toBe('0');
    });
    
    it('should throw error for non-stroke SVGs', () => {
      const metadata = {
        classification: 'flattened' as const,
        flags: ['isFlattened'] as any,
        nodeCount: { path: 1, g: 0 }
      };
      
      expect(() => drawPath({ duration: 1000 }, metadata)).toThrow(UnsupportedPrimitiveError);
    });
    
    it('should accept custom selector', () => {
      const effect = drawPath({ duration: 2000, selector: '.my-path' }, strokeMetadata);
      expect(effect.targetSelector).toBe('.my-path');
    });
  });
  
  describe('staggerFadeIn', () => {
    const structuredMetadata = {
      classification: 'structured' as const,
      flags: ['isStructured'] as any,
      nodeCount: { path: 2, g: 1 }
    };
    
    it('should create stagger effect', () => {
      const effect = staggerFadeIn({
        duration: 400,
        childSelector: 'g > *',
        stagger: 100
      }, structuredMetadata);
      
      expect(effect.targetSelector).toBe('g > *');
      expect(effect.keyframes[0].opacity).toBe(0);
      expect(effect.keyframes[1].opacity).toBe(1);
    });
    
    it('should throw error for non-structured SVGs', () => {
      const metadata = {
        classification: 'flattened' as const,
        flags: ['isFlattened'] as any,
        nodeCount: { path: 1, g: 0 }
      };
      
      expect(() => 
        staggerFadeIn({ duration: 400, childSelector: 'g > *', stagger: 100 }, metadata)
      ).toThrow(UnsupportedPrimitiveError);
    });
  });
}); 