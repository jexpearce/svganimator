import type { Meta, StoryObj } from '@storybook/react';
import { MotionElement } from '../components/MotionElement.js';

const meta: Meta<typeof MotionElement> = {
  title: 'Components/MotionElement',
  component: MotionElement,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const simpleSvg = `
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#3B82F6"/>
  </svg>
`;

const structuredSvg = `
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <g id="logo-group">
      <rect x="40" y="40" width="40" height="40" fill="#EF4444"/>
      <rect x="120" y="40" width="40" height="40" fill="#10B981"/>
      <rect x="40" y="120" width="40" height="40" fill="#F59E0B"/>
      <rect x="120" y="120" width="40" height="40" fill="#6366F1"/>
    </g>
  </svg>
`;

const strokeBasedSvg = `
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,100 L100,40 L160,100" stroke="#8B5CF6" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="100" cy="140" r="30" stroke="#8B5CF6" stroke-width="6" fill="none"/>
  </svg>
`;

export const Static: Story = {
  args: {
    svgString: simpleSvg
  }
};

export const FadeIn: Story = {
  args: {
    svgString: simpleSvg,
    animationConfig: {
      type: 'fadeIn',
      options: { duration: 1000 }
    }
  }
};

export const Scale: Story = {
  args: {
    svgString: simpleSvg,
    animationConfig: {
      type: 'scale',
      options: { duration: 800, from: 0, to: 1 }
    }
  }
};

export const SlideInFromLeft: Story = {
  args: {
    svgString: simpleSvg,
    animationConfig: {
      type: 'slideIn',
      options: { duration: 600, fromDirection: 'left', distance: '100px' }
    }
  }
};

export const SlideInFromBottom: Story = {
  args: {
    svgString: simpleSvg,
    animationConfig: {
      type: 'slideIn',
      options: { duration: 600, fromDirection: 'bottom', distance: '50px' }
    }
  }
};

export const DrawPath: Story = {
  args: {
    svgString: strokeBasedSvg,
    animationConfig: {
      type: 'drawPath',
      options: { duration: 2000 }
    }
  }
};

export const StaggerFadeIn: Story = {
  args: {
    svgString: structuredSvg,
    animationConfig: {
      type: 'staggerFadeIn',
      options: { 
        duration: 400, 
        childSelector: 'g > rect',
        stagger: 100
      }
    }
  }
};

export const CustomSelector: Story = {
  args: {
    svgString: structuredSvg,
    animationConfig: {
      type: 'fadeIn',
      options: { 
        duration: 1000,
        selector: '#logo-group'
      }
    }
  }
}; 