import React, { useRef, useEffect } from 'react';
import { useSvgAnalysis } from '../hooks/useSvgAnalysis.js';
import { usePrimitivePlayer } from '../hooks/usePrimitivePlayer.js';
import type { PrimitiveMap } from '@motif/schema';

export interface MotionElementProps<T extends keyof PrimitiveMap = keyof PrimitiveMap> {
  svgString: string;
  animationConfig?: {
    type: T;
    options: PrimitiveMap[T];
  };
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component that renders an SVG with optional animation
 */
export function MotionElement<T extends keyof PrimitiveMap>({
  svgString,
  animationConfig,
  className,
  style
}: MotionElementProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const { data: analysisResult, loading, error } = useSvgAnalysis(svgString);
  
  // Play animation when ready
  const playerConfig = animationConfig && analysisResult ? {
    type: animationConfig.type,
    options: animationConfig.options,
    metadata: analysisResult.metadata
  } : null;
  
  usePrimitivePlayer(svgRef, playerConfig);
  
  // Insert cleaned SVG into container
  useEffect(() => {
    if (!containerRef.current || !analysisResult) return;
    
    // Parse and insert the cleaned SVG
    containerRef.current.innerHTML = analysisResult.cleanedSvgString;
    
    // Get reference to the inserted SVG element
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      (svgRef as any).current = svg;
    }
  }, [analysisResult]);
  
  if (loading) {
    return <div className={className} style={style}>Loading...</div>;
  }
  
  if (error) {
    return <div className={className} style={style}>Error: {error.message}</div>;
  }
  
  return (
    <div 
      ref={containerRef}
      className={className}
      style={style}
      dangerouslySetInnerHTML={undefined}
    />
  );
} 