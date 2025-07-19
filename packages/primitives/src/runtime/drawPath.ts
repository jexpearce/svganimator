/**
 * Runtime helper for drawPath animation that computes actual path lengths
 * This would be used by the player/runtime to enhance the static effect spec
 */
export interface DrawPathRuntime {
  selector: string;
  duration: number;
  stagger?: number;
}

export function enhanceDrawPathEffect(
  element: SVGElement,
  duration: number
): KeyframeEffect | null {
  // Only process elements with getTotalLength method
  if (!('getTotalLength' in element) || typeof element.getTotalLength !== 'function') {
    return null;
  }
  
  const pathElement = element as SVGPathElement | SVGCircleElement | SVGRectElement;
  const length = pathElement.getTotalLength();
  
  // Create keyframes with actual path length
  const keyframes = [
    {
      strokeDasharray: `${length}`,
      strokeDashoffset: `${length}`
    },
    {
      strokeDasharray: `${length}`,
      strokeDashoffset: '0'
    }
  ];
  
  return new KeyframeEffect(
    element,
    keyframes,
    {
      duration,
      easing: 'ease',
      fill: 'forwards'
    }
  );
}

// Path length cache to avoid repeated calculations
const pathLengthCache = new WeakMap<SVGElement, number>();

export function getCachedPathLength(element: SVGElement): number | null {
  if (pathLengthCache.has(element)) {
    return pathLengthCache.get(element)!;
  }
  
  if ('getTotalLength' in element && typeof element.getTotalLength === 'function') {
    const length = (element as any).getTotalLength();
    pathLengthCache.set(element, length);
    return length;
  }
  
  return null;
} 