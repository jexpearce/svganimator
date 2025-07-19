import { describe, it, expect } from 'vitest';
import { createEffect, calculateStagger } from '../helpers.js';

describe('Helper functions', () => {
  describe('createEffect', () => {
    it('should create a valid KeyframeEffectSpec', () => {
      const effect = createEffect(
        '.target',
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 1000 }
      );
      
      expect(effect.targetSelector).toBe('.target');
      expect(effect.keyframes).toHaveLength(2);
      expect(effect.timing.duration).toBe(1000);
      expect(effect.timing.easing).toBe('ease');
      expect(effect.timing.delay).toBe(0);
      expect(effect.timing.fill).toBe('forwards');
    });
    
    it('should preserve custom timing options', () => {
      const effect = createEffect(
        '.target',
        [{ opacity: 0 }, { opacity: 1 }],
        { 
          duration: 500,
          easing: 'ease-in-out',
          delay: 100,
          fill: 'both'
        }
      );
      
      expect(effect.timing.easing).toBe('ease-in-out');
      expect(effect.timing.delay).toBe(100);
      expect(effect.timing.fill).toBe('both');
    });
    
    it('should throw error for empty selector', () => {
      expect(() => 
        createEffect('', [{ opacity: 0 }], { duration: 1000 })
      ).toThrow('Target selector is required');
    });
    
    it('should throw error for empty keyframes', () => {
      expect(() => 
        createEffect('.target', [], { duration: 1000 })
      ).toThrow('At least one keyframe is required');
    });
    
    it('should throw error for invalid duration', () => {
      expect(() => 
        createEffect('.target', [{ opacity: 0 }], { duration: -100 })
      ).toThrow('Duration must be a positive number');
      
      expect(() => 
        createEffect('.target', [{ opacity: 0 }], { duration: 0 })
      ).toThrow('Duration must be a positive number');
    });
  });
  
  describe('calculateStagger', () => {
    it('should calculate stagger correctly', () => {
      expect(calculateStagger(0, 100)).toBe(0);
      expect(calculateStagger(1, 100)).toBe(100);
      expect(calculateStagger(2, 100)).toBe(200);
    });
    
    it('should include base delay', () => {
      expect(calculateStagger(0, 100, 50)).toBe(50);
      expect(calculateStagger(1, 100, 50)).toBe(150);
      expect(calculateStagger(2, 100, 50)).toBe(250);
    });
  });
}); 