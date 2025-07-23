import { useCallback, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { PrimitiveArgumentSchema, type SvgMetadata } from '@motif/schema';
import type { AnimationConfig } from '@/store/app-store';

export function useSuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const { svgMeta, setSuggestedAnimations, setAnimationConfig, setIsSuggesting, setError } = useAppStore();

  const suggest = useCallback(async (prompt: string) => {
    if (!svgMeta) {
      setError('No SVG loaded');
      return;
    }

    setIsLoading(true);
    setIsSuggesting(true);
    setError(null);

    try {
      // Convert our metadata to the format expected by the API
      const metadata: SvgMetadata = {
        isStrokeBased: svgMeta.metadata.flags.includes('isStrokeBased'),
        isStructured: svgMeta.metadata.flags.includes('isStructured'),
        hasGroups: svgMeta.metadata.nodeCount.g > 0,
        elementCount: Object.values(svgMeta.metadata.nodeCount).reduce((sum, count) => sum + count, 0),
        hasPaths: svgMeta.metadata.nodeCount.path > 0,
      };

      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          svgMeta: metadata,
          prompt,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get suggestions');
      }

      const data = await response.json();
      
      // Validate and transform suggestions
      const validSuggestions: AnimationConfig[] = [];
      
      for (const suggestion of data.suggestions) {
        const result = PrimitiveArgumentSchema.safeParse(suggestion);
        if (result.success) {
          validSuggestions.push(result.data as AnimationConfig);
        } else {
          console.warn('Invalid suggestion:', suggestion, result.error);
        }
      }

      if (validSuggestions.length === 0) {
        throw new Error('No valid suggestions returned');
      }

      setSuggestedAnimations(validSuggestions);
      
      // Auto-select the first suggestion
      setAnimationConfig(validSuggestions[0]);
    } catch (error) {
      console.error('Suggestion error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get suggestions');
      
      // Clear existing suggestions before adding fallbacks
      setSuggestedAnimations([]);
      
      // Fallback suggestions based on SVG type
      const fallbacks: AnimationConfig[] = [];
      
      if (svgMeta.metadata.flags.includes('isStrokeBased')) {
        fallbacks.push({ type: 'drawPath', options: { duration: 2000 } });
      } else if (svgMeta.metadata.flags.includes('isStructured')) {
        fallbacks.push({ type: 'staggerFadeIn', options: { duration: 400, childSelector: 'g > *', stagger: 100 } });
      } else {
        fallbacks.push({ type: 'fadeIn', options: { duration: 1000 } });
      }
      
      setSuggestedAnimations(fallbacks);
      setAnimationConfig(fallbacks[0]);
    } finally {
      setIsLoading(false);
      setIsSuggesting(false);
    }
  }, [svgMeta, setSuggestedAnimations, setAnimationConfig, setIsSuggesting, setError]);

  return { suggest, isLoading };
} 