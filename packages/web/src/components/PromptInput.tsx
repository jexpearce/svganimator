'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSuggestion } from '@/hooks/useSuggestion';
import { cn } from '@/lib/utils';

const EXAMPLE_PROMPTS = [
  "Fade in smoothly",
  "Draw the paths one by one",
  "Make it scale up from the center",
  "Slide in from the left",
  "Stagger the elements appearing",
];

export function PromptInput() {
  const { prompt, setPrompt, svgMeta } = useAppStore();
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const { suggest, isLoading } = useSuggestion();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPrompt.trim() || !svgMeta || isLoading) return;
    
    setPrompt(localPrompt);
    await suggest(localPrompt);
  }, [localPrompt, svgMeta, isLoading, setPrompt, suggest]);

  const handleExample = useCallback((example: string) => {
    setLocalPrompt(example);
    setPrompt(example);
    if (svgMeta) {
      suggest(example);
    }
  }, [svgMeta, setPrompt, suggest]);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium text-slate-700">
          Describe the animation
        </label>
        <div className="relative">
          <input
            id="prompt"
            type="text"
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="e.g., fade in smoothly, draw the paths..."
            className={cn(
              "w-full px-3 py-2 pr-10 text-sm rounded-md border",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "placeholder:text-slate-400"
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!localPrompt.trim() || isLoading}
            className={cn(
              "absolute right-1 top-1 p-1.5 rounded-md transition-colors",
              localPrompt.trim() && !isLoading
                ? "text-brand-600 hover:bg-brand-50"
                : "text-slate-300"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
      
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            onClick={() => handleExample(example)}
            disabled={isLoading}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full transition-colors",
              "bg-slate-100 text-slate-600 hover:bg-slate-200",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
} 