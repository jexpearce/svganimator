'use client';

import { RadioGroup } from '@headlessui/react';
import { Check } from 'lucide-react';
import { useAppStore, type AnimationConfig } from '@/store/app-store';
import { cn, getAnimationDescription } from '@/lib/utils';

interface AnimationSelectorProps {
  suggestions: AnimationConfig[];
}

const animationIcons: Record<string, string> = {
  fadeIn: '👁',
  scale: '🔍',
  slideIn: '➡️',
  drawPath: '✏️',
  staggerFadeIn: '🎭',
};

export function AnimationSelector({ suggestions }: AnimationSelectorProps) {
  const { animationConfig, setAnimationConfig } = useAppStore();
  
  if (suggestions.length === 0) return null;

  return (
    <RadioGroup value={animationConfig} onChange={setAnimationConfig}>
      <div className="space-y-2">
        {suggestions.map((config, index) => (
          <RadioGroup.Option
            key={`${config.type}-${index}`}
            value={config}
            className={({ checked }) =>
              cn(
                "relative flex cursor-pointer rounded-lg px-4 py-3 shadow-sm transition-all",
                "focus:outline-none focus:ring-2 focus:ring-brand-500",
                checked
                  ? "bg-brand-50 border-brand-200"
                  : "bg-white border-slate-200 hover:bg-slate-50",
                "border"
              )
            }
          >
            {({ checked }) => (
              <>
                <div className="flex flex-1 items-center">
                  <div className="text-2xl mr-3">
                    {animationIcons[config.type] || '🎬'}
                  </div>
                  <div className="flex-1">
                    <RadioGroup.Label
                      as="p"
                      className={cn(
                        "text-sm font-medium",
                        checked ? "text-brand-900" : "text-slate-900"
                      )}
                    >
                      {config.type}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={cn(
                        "text-xs",
                        checked ? "text-brand-700" : "text-slate-500"
                      )}
                    >
                      {getAnimationDescription(config)}
                    </RadioGroup.Description>
                  </div>
                  
                  {checked && (
                    <div className="flex-shrink-0 text-brand-600">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
} 