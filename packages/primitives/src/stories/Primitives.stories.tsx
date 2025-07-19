import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect } from 'react';
import * as primitives from '../index.js';

const meta: Meta = {
  title: 'Primitives/Showcase',
  parameters: {
    layout: 'centered'
  }
};

export default meta;

interface PrimitiveShowcaseProps {
  primitive: keyof typeof primitives;
  options: any;
  metadata?: any;
}

function PrimitiveShowcase({ primitive, options, metadata }: PrimitiveShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create SVG based on primitive type
    let svg: string;
    if (primitive === 'drawPath') {
      svg = `
        <svg width="200" height="200" viewBox="0 0 200 200">
          <path d="M20,100 C50,20 150,20 180,100" stroke="#3B82F6" stroke-width="4" fill="none"/>
        </svg>
      `;
    } else if (primitive === 'staggerFadeIn') {
      svg = `
        <svg width="200" height="200" viewBox="0 0 200 200">
          <g>
            <circle cx="50" cy="50" r="20" fill="#EF4444"/>
            <circle cx="100" cy="50" r="20" fill="#10B981"/>
            <circle cx="150" cy="50" r="20" fill="#F59E0B"/>
            <circle cx="50" cy="100" r="20" fill="#6366F1"/>
            <circle cx="100" cy="100" r="20" fill="#8B5CF6"/>
            <circle cx="150" cy="100" r="20" fill="#EC4899"/>
          </g>
        </svg>
      `;
    } else {
      svg = `
        <svg width="200" height="200" viewBox="0 0 200 200">
          <rect x="50" y="50" width="100" height="100" fill="#3B82F6" rx="10"/>
        </svg>
      `;
    }
    
    containerRef.current.innerHTML = svg;
    
    // Get the primitive function
    const fn = primitives[primitive] as any;
    const effectSpec = metadata ? fn(options, metadata) : fn(options);
    
    // Apply animation
    const svgElement = containerRef.current.querySelector('svg');
    if (svgElement) {
      const targets = svgElement.querySelectorAll(effectSpec.targetSelector);
      targets.forEach((target, index) => {
        const delay = primitive === 'staggerFadeIn' 
          ? (effectSpec.timing.delay || 0) + (index * options.stagger)
          : effectSpec.timing.delay || 0;
          
        target.animate(effectSpec.keyframes, {
          ...effectSpec.timing,
          delay
        });
      });
    }
  }, [primitive, options, metadata]);
  
  return <div ref={containerRef} />;
}

export const FadeInShowcase: StoryObj = {
  render: () => (
    <PrimitiveShowcase 
      primitive="fadeIn"
      options={{ duration: 1000, from: 0, to: 1 }}
    />
  )
};

export const ScaleShowcase: StoryObj = {
  render: () => (
    <PrimitiveShowcase 
      primitive="scale"
      options={{ duration: 800, from: 0, to: 1, origin: 'center' }}
    />
  )
};

export const SlideInShowcase: StoryObj = {
  render: () => (
    <PrimitiveShowcase 
      primitive="slideIn"
      options={{ duration: 600, fromDirection: 'left', distance: '100px' }}
    />
  )
};

export const DrawPathShowcase: StoryObj = {
  render: () => (
    <PrimitiveShowcase 
      primitive="drawPath"
      options={{ duration: 2000 }}
      metadata={{ 
        classification: 'flattened',
        flags: ['isStrokeBased'],
        nodeCount: { path: 1, g: 0 }
      }}
    />
  )
};

export const StaggerFadeInShowcase: StoryObj = {
  render: () => (
    <PrimitiveShowcase 
      primitive="staggerFadeIn"
      options={{ duration: 300, childSelector: 'g > circle', stagger: 100 }}
      metadata={{ 
        classification: 'structured',
        flags: ['isStructured'],
        nodeCount: { circle: 6, g: 1 }
      }}
    />
  )
}; 