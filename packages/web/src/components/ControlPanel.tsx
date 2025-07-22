'use client';

import { useState, useMemo } from 'react';
import { Wand2, Code, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { PromptInput } from '@/components/PromptInput';
import { AnimationSelector } from '@/components/AnimationSelector';
import { ParameterControls } from '@/components/ParameterControls';
import { cn } from '@/lib/utils';

export function ControlPanel() {
  const { 
    animationConfig, 
    suggestedAnimations,
    setExportModalOpen,
    svgMeta 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'prompt' | 'manual'>('prompt');
  
  // Memoize manual suggestions to maintain reference equality
  const manualSuggestions = useMemo(() => [
    { type: 'fadeIn' as const, options: { duration: 1000 } },
    { type: 'scale' as const, options: { duration: 800, from: 0.5, to: 1 } },
    { type: 'slideIn' as const, options: { duration: 600, fromDirection: 'left' as const, distance: '100px' } },
    ...((svgMeta?.metadata.flags ?? []).includes('isStrokeBased') 
      ? [{ type: 'drawPath' as const, options: { duration: 2000 } }]
      : []),
    ...((svgMeta?.metadata.flags ?? []).includes('isStructured')
      ? [{ type: 'staggerFadeIn' as const, options: { duration: 400, childSelector: 'g > *', stagger: 100 } }]
      : []),
  ], [svgMeta]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Animation Controls</h2>
        
        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('prompt')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'prompt'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Wand2 className="w-4 h-4" />
            AI Assist
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'manual'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Manual
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {activeTab === 'prompt' ? (
          <>
            <PromptInput />
            
            {suggestedAnimations.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Suggested Animations
                </label>
                <AnimationSelector suggestions={suggestedAnimations} />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <AnimationSelector suggestions={manualSuggestions} />
          </div>
        )}
        
        {animationConfig && (
          <>
            <div className="border-t pt-4">
              <ParameterControls />
            </div>
            
            <button
              onClick={() => setExportModalOpen(true)}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              <Code className="w-4 h-4" />
              Get Code
            </button>
          </>
        )}
      </div>
    </div>
  );
} 