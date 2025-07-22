'use client';

import { useAppStore } from '@/store/app-store';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import type { PrimitiveMap } from '@motif/schema';

export function ParameterControls() {
  const { animationConfig, updateAnimationOption } = useAppStore();
  
  if (!animationConfig) return null;
  
  const { type, options } = animationConfig;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700">Parameters</h3>
      
      {/* Duration (common to all) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">
          Duration: {options.duration}ms
        </label>
        <Slider
          value={options.duration}
          onChange={(value) => updateAnimationOption('duration', value)}
          min={100}
          max={5000}
          step={100}
        />
      </div>
      
      {/* Delay */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">
          Delay: {options.delay || 0}ms
        </label>
        <Slider
          value={options.delay || 0}
          onChange={(value) => updateAnimationOption('delay', value)}
          min={0}
          max={2000}
          step={50}
        />
      </div>
      
      {/* Easing */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">Easing</label>
        <Select
          value={options.easing || 'ease'}
          onChange={(value) => updateAnimationOption('easing', value)}
          options={[
            { value: 'ease', label: 'Ease' },
            { value: 'ease-in', label: 'Ease In' },
            { value: 'ease-out', label: 'Ease Out' },
            { value: 'ease-in-out', label: 'Ease In Out' },
            { value: 'linear', label: 'Linear' },
          ]}
        />
      </div>
      
      {/* Type-specific controls */}
      {type === 'fadeIn' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              From: {(options as PrimitiveMap['fadeIn']).from ?? 0}
            </label>
            <Slider
              value={(options as PrimitiveMap['fadeIn']).from ?? 0}
              onChange={(value) => updateAnimationOption('from', value)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              To: {(options as PrimitiveMap['fadeIn']).to ?? 1}
            </label>
            <Slider
              value={(options as PrimitiveMap['fadeIn']).to ?? 1}
              onChange={(value) => updateAnimationOption('to', value)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </>
      )}
      
      {type === 'scale' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              From: {(options as PrimitiveMap['scale']).from}
            </label>
            <Slider
              value={(options as PrimitiveMap['scale']).from}
              onChange={(value) => updateAnimationOption('from', value)}
              min={0}
              max={2}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              To: {(options as PrimitiveMap['scale']).to}
            </label>
            <Slider
              value={(options as PrimitiveMap['scale']).to}
              onChange={(value) => updateAnimationOption('to', value)}
              min={0}
              max={2}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Origin</label>
            <Select
              value={(options as PrimitiveMap['scale']).origin || 'center'}
              onChange={(value) => updateAnimationOption('origin', value)}
              options={[
                { value: 'center', label: 'Center' },
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
                { value: 'top left', label: 'Top Left' },
                { value: 'top right', label: 'Top Right' },
                { value: 'bottom left', label: 'Bottom Left' },
                { value: 'bottom right', label: 'Bottom Right' },
              ]}
            />
          </div>
        </>
      )}
      
      {type === 'slideIn' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Direction</label>
            <Select
              value={(options as PrimitiveMap['slideIn']).fromDirection}
              onChange={(value) => updateAnimationOption('fromDirection', value)}
              options={[
                { value: 'left', label: 'From Left' },
                { value: 'right', label: 'From Right' },
                { value: 'top', label: 'From Top' },
                { value: 'bottom', label: 'From Bottom' },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Distance</label>
            <Select
              value={(options as PrimitiveMap['slideIn']).distance}
              onChange={(value) => updateAnimationOption('distance', value)}
              options={[
                { value: '50px', label: '50px' },
                { value: '100px', label: '100px' },
                { value: '150px', label: '150px' },
                { value: '200px', label: '200px' },
              ]}
            />
          </div>
        </>
      )}
      
      {type === 'drawPath' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">
            Stagger: {(options as PrimitiveMap['drawPath']).stagger || 0}ms
          </label>
          <Slider
            value={(options as PrimitiveMap['drawPath']).stagger || 0}
            onChange={(value) => updateAnimationOption('stagger', value)}
            min={0}
            max={500}
            step={50}
          />
        </div>
      )}
      
      {type === 'staggerFadeIn' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Stagger: {(options as PrimitiveMap['staggerFadeIn']).stagger}ms
            </label>
            <Slider
              value={(options as PrimitiveMap['staggerFadeIn']).stagger}
              onChange={(value) => updateAnimationOption('stagger', value)}
              min={50}
              max={500}
              step={50}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Child Selector
            </label>
            <input
              type="text"
              value={(options as PrimitiveMap['staggerFadeIn']).childSelector}
              onChange={(e) => updateAnimationOption('childSelector', e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </>
      )}
    </div>
  );
} 