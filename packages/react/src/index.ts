// Headless React bindings for Motif
import React from 'react';
import type { KeyframeEffectSpec } from '@motif/schema';

interface MotionElementProps {
  svgString: string;
  animationConfig: KeyframeEffectSpec;
}

export function MotionElement({ svgString, animationConfig }: MotionElementProps) {
  return React.createElement('div', {}, 
    React.createElement('div', { 
      dangerouslySetInnerHTML: { __html: svgString } 
    })
  );
} 