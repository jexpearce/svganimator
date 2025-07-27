'use client';

import { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { MotionElement } from '@motif/react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

export function PreviewPanel() {
  const { svgString, svgMeta, animationConfig, setIsPlaying } = useAppStore();
  const playerRef = useRef<{ play: () => void; cancel: () => void } | null>(null);

  const handleReplay = () => {
    if (playerRef.current) {
      playerRef.current.cancel();
      setTimeout(() => {
        playerRef.current?.play();
        setIsPlaying(true);
      }, 50);
    }
  };

  useEffect(() => {
    // Auto-play when animation config changes
    if (animationConfig && playerRef.current) {
      handleReplay();
    }
  }, [animationConfig]);

  if (!svgString || !svgMeta) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
        
        {animationConfig && (
          <button
            onClick={handleReplay}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
              "bg-brand-600 text-white hover:bg-brand-700"
            )}
          >
            <RotateCcw className="w-4 h-4" />
            Replay
          </button>
        )}
      </div>
      
      <div className="p-8 min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          {animationConfig ? (
            <MotionElement
              svgString={svgString}
              animationConfig={animationConfig}
              className="max-w-full max-h-[350px]"
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: svgMeta.cleanedSvgString }}
              className="max-w-[350px] w-full h-auto mx-auto"
            />
          )}
          
          {!animationConfig && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-slate-600">
                Add an animation to preview
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t bg-slate-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Classification:</span>
            <span className="ml-2 font-medium text-slate-900">
              {svgMeta.metadata.classification}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Elements:</span>
            <span className="ml-2 font-medium text-slate-900">
              {Object.entries(svgMeta.metadata.nodeCount)
                .filter(([, count]) => count > 0)
                .map(([tag, count]) => `${count} ${tag}`)
                .join(', ')}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Features:</span>
            <span className="ml-2 font-medium text-slate-900">
              {svgMeta.metadata.flags.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 