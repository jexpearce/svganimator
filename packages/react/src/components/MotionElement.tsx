import React, {
  forwardRef, useEffect, useRef, useImperativeHandle, Ref,
} from 'react';
import { useSvgAnalysis } from '../hooks/useSvgAnalysis.js';
import { usePrimitivePlayer } from '../hooks/usePrimitivePlayer.js';
import type { PrimitiveMap } from '@motif/schema';

export interface MotionElementProps<T extends keyof PrimitiveMap = keyof PrimitiveMap> {
  svgString: string;
  animationConfig?: { type: T; options: PrimitiveMap[T]; };
  className?: string;
  style?: React.CSSProperties;
}

export interface MotionHandle {
  play(): void;
  pause(): void;
  cancel(): void;
}

export const MotionElement = forwardRef<MotionHandle, MotionElementProps>(function MotionElement(
  { svgString, animationConfig, className, style },
  ref: Ref<MotionHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement | null>(null);

  const { data: analysis, loading, error } = useSvgAnalysis(svgString);
  const playerConfig = animationConfig && analysis
    ? { type: animationConfig.type, options: animationConfig.options, metadata: analysis.metadata }
    : null;

  /* mount / update cleaned SVG */
  useEffect(() => {
    if (!containerRef.current || !analysis) return;
    containerRef.current.innerHTML = analysis.cleanedSvgString;
    svgRef.current = containerRef.current.querySelector('svg');
  }, [analysis]);

  const player = usePrimitivePlayer(svgRef, playerConfig);

  useImperativeHandle(ref, () => ({
    play:   () => player.play(),
    pause:  () => player.pause(),
    cancel: () => player.cancel(),
  }), [player]);

  if (loading) return <div className={className} style={style}>Loading…</div>;
  if (error)   return <div className={className} style={style}>Error: {error.message}</div>;

  return <div ref={containerRef} className={className} style={style} />;
});
