// Animation primitive generators for Motif
import type { AnimationConfig } from '@motif/schema';

export function fadeIn(options: { duration: number; from: number; to: number }): AnimationConfig {
  return {
    type: 'fadeIn',
    options
  };
}

export function scale(options: { duration: number; from: number; to: number; origin: string }): AnimationConfig {
  return {
    type: 'scale',
    options
  };
} 