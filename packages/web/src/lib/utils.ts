import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AnimationConfig } from '@/store/app-store';
import type { PrimitiveMap } from '@motif/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidSvg(content: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    return !parserError && doc.documentElement.tagName === 'svg';
  } catch {
    return false;
  }
}

export function getAnimationDescription(config: AnimationConfig): string {
  switch (config.type) {
    case 'fadeIn':
      return `Fade in from ${config.options.from ?? 0} to ${config.options.to ?? 1}`;
    case 'scale':
      return `Scale from ${config.options.from} to ${config.options.to}`;
    case 'slideIn':
      return `Slide in from ${config.options.fromDirection}`;
    case 'drawPath':
      return `Draw paths with ${config.options.duration}ms duration`;
    case 'staggerFadeIn':
      return `Stagger fade in with ${config.options.stagger}ms delay`;
    default:
      return 'Custom animation';
  }
}

export function generateCssAnimation(config: AnimationConfig, elementCount?: number): string {
  const { type, options } = config;
  const duration = options.duration / 1000;
  const delay = (options.delay || 0) / 1000;
  const easing = options.easing || 'ease';

  let keyframes = '';
  let animationName = '';
  let animationRule = '';

  switch (type) {
    case 'fadeIn':
      animationName = 'motif-fade-in';
      keyframes = `
@keyframes ${animationName} {
  from { opacity: ${options.from ?? 0}; }
  to { opacity: ${options.to ?? 1}; }
}`;
      animationRule = `animation: ${animationName} ${duration}s ${easing} ${delay}s forwards;`;
      break;

    case 'scale':
      animationName = 'motif-scale';
      keyframes = `
@keyframes ${animationName} {
  from { transform: scale(${options.from}); }
  to { transform: scale(${options.to}); }
}`;
      animationRule = `
transform-origin: ${options.origin || 'center'};
animation: ${animationName} ${duration}s ${easing} ${delay}s forwards;`;
      break;

    case 'slideIn': {
      animationName = 'motif-slide-in';
      const transforms: Record<typeof options.fromDirection, string> = {
        left: `translateX(-${options.distance})`,
        right: `translateX(${options.distance})`,
        top: `translateY(-${options.distance})`,
        bottom: `translateY(${options.distance})`,
      };
      keyframes = `
@keyframes ${animationName} {
  from { 
    transform: ${transforms[options.fromDirection]};
    opacity: 0;
  }
  to { 
    transform: translate(0);
    opacity: 1;
  }
}`;
      animationRule = `animation: ${animationName} ${duration}s ${easing} ${delay}s forwards;`;
      break;
    }

    case 'drawPath':
      return `/* Path drawing animation
   Note: This requires inline styles on each path element
   with stroke-dasharray and stroke-dashoffset set to path length */

.animated-path {
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  animation: motif-draw ${duration}s ${easing} ${delay}s forwards;
}

@keyframes motif-draw {
  to {
    stroke-dashoffset: 0;
  }
}`;

    case 'staggerFadeIn': {
      const stagger = (options as PrimitiveMap['staggerFadeIn']).stagger / 1000;
      const maxElements = elementCount || 10;
      return `/* Stagger fade-in animation */

${(options as PrimitiveMap['staggerFadeIn']).childSelector} {
  opacity: 0;
  transform: translateY(10px);
  animation: motif-stagger-fade ${duration}s ${easing} forwards;
}

${Array.from({ length: maxElements }, (_, i) => `
${(options as PrimitiveMap['staggerFadeIn']).childSelector}:nth-child(${i + 1}) {
  animation-delay: ${delay + i * stagger}s;
}`).join('')}

@keyframes motif-stagger-fade {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;
    }
  }

  return `${keyframes}\n\n.animated-element {\n  ${animationRule}\n}`;
}

export function generateReactCode(config: AnimationConfig): string {
  const options = JSON.stringify(config.options, null, 2).replace(/"([^"]+)":/g, '$1:');
  
  return `import { MotionElement } from '@motif/react';

function AnimatedLogo() {
  return (
    <MotionElement
      svgString={svgString}
      animationConfig={{
        type: '${config.type}',
        options: ${options}
      }}
    />
  );
}`;
}

export function generateVueCode(config: AnimationConfig): string {
  const options = JSON.stringify(config.options, null, 2).replace(/"([^"]+)":/g, '$1:');
  
  return `<template>
  <div ref="container" v-html="animatedSvg"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { analyzeSvg } from '@motif/analysis';
import { primitives } from '@motif/primitives';

const container = ref(null);
const svgString = \`<!-- Your SVG here -->\`;

onMounted(async () => {
  const analysis = await analyzeSvg(svgString);
  const effect = primitives.${config.type}(${options}${
    config.type === 'drawPath' || config.type === 'staggerFadeIn' ? ', analysis.metadata' : ''
  });
  
  // Apply animation to elements
  const targets = container.value.querySelectorAll(effect.targetSelector);
  targets.forEach(target => {
    target.animate(effect.keyframes, effect.timing);
  });
});
</script>`;
} 