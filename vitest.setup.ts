import { vi } from 'vitest';

// Mock Web Animations API
if (typeof globalThis.KeyframeEffect === 'undefined') {
  (globalThis as any).KeyframeEffect = class MockKeyframeEffect {
    constructor(
      public target: Element,
      public keyframes: Keyframe[],
      public options: KeyframeEffectOptions
    ) {}
  };
}

if (typeof globalThis.Animation === 'undefined') {
  (globalThis as any).Animation = class MockAnimation {
    constructor(
      public effect: KeyframeEffect,
      public timeline: AnimationTimeline
    ) {
      this.playState = 'idle';
      this.currentTime = 0;
    }
    
    playState: string;
    currentTime: number | null;
    startTime: number | null = null;
    
    play() {
      this.playState = 'running';
    }
    
    pause() {
      this.playState = 'paused';
    }
    
    cancel() {
      this.playState = 'idle';
      this.currentTime = null;
    }
    
    finish() {
      this.playState = 'finished';
    }
  };
}

if (typeof globalThis.document.timeline === 'undefined') {
  Object.defineProperty(globalThis.document, 'timeline', {
    value: {
      currentTime: 0
    },
    writable: true
  });
}

// Mock Element.animate if not available
if (typeof Element.prototype.animate === 'undefined') {
  Element.prototype.animate = vi.fn().mockImplementation(function(
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ) {
    return {
      play: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      finish: vi.fn(),
      currentTime: 0,
      playState: 'idle'
    };
  });
} 