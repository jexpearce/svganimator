// Headless React bindings for Motif
import React from 'react';
import type { AnimationConfig } from '@motif/schema';

interface MotionElementProps {
  svgString: string;
  animationConfig: AnimationConfig;
}

export function MotionElement({ svgString, animationConfig }: MotionElementProps) {
  return (
    <div>
      {/* TODO: Implement MotionElement */}
      <div dangerouslySetInnerHTML={{ __html: svgString }} />
    </div>
  );
} 