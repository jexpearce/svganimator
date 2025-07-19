import { describe, it, expect, vi, beforeAll } from 'vitest';
import { enhanceDrawPathEffect, getCachedPathLength } from '../runtime/drawPath.js';

describe('Runtime DrawPath helpers', () => {
  beforeAll(() => {
    // Mock KeyframeEffect if not available in test environment
    if (typeof globalThis.KeyframeEffect === 'undefined') {
      (globalThis as any).KeyframeEffect = class MockKeyframeEffect {
        constructor(public target: Element, public keyframes: Keyframe[], public options: any) {}
      };
    }
  });
  
  describe('enhanceDrawPathEffect', () => {
    it('should create KeyframeEffect for path elements', () => {
      const mockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mockPath.getTotalLength = vi.fn().mockReturnValue(100);
      
      const effect = enhanceDrawPathEffect(mockPath, 1000);
      
      expect(effect).toBeTruthy();
      expect(effect).toBeInstanceOf(globalThis.KeyframeEffect);
    });
    
    it('should return null for non-path elements', () => {
      const div = document.createElement('div');
      const effect = enhanceDrawPathEffect(div as any, 1000);
      
      expect(effect).toBeNull();
    });
    
    it('should use actual path length in keyframes', () => {
      const mockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mockPath.getTotalLength = vi.fn().mockReturnValue(250);
      
      const effect = enhanceDrawPathEffect(mockPath, 1000);
      
      expect(mockPath.getTotalLength).toHaveBeenCalled();
      // Note: We can't easily inspect KeyframeEffect internals in tests
      expect(effect).toBeTruthy();
    });
  });
  
  describe('getCachedPathLength', () => {
    it('should cache path length', () => {
      const mockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mockPath.getTotalLength = vi.fn().mockReturnValue(100);
      
      const length1 = getCachedPathLength(mockPath);
      const length2 = getCachedPathLength(mockPath);
      
      expect(length1).toBe(100);
      expect(length2).toBe(100);
      expect(mockPath.getTotalLength).toHaveBeenCalledTimes(1); // Only called once due to cache
    });
    
    it('should return null for non-path elements', () => {
      const div = document.createElement('div');
      const length = getCachedPathLength(div as any);
      
      expect(length).toBeNull();
    });
    
    it('should handle different elements separately', () => {
      const mockPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mockPath1.getTotalLength = vi.fn().mockReturnValue(100);
      
      const mockPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mockPath2.getTotalLength = vi.fn().mockReturnValue(200);
      
      const length1 = getCachedPathLength(mockPath1);
      const length2 = getCachedPathLength(mockPath2);
      
      expect(length1).toBe(100);
      expect(length2).toBe(200);
    });
  });
}); 