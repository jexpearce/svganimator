import { useState, useCallback } from 'react';
import type { SvgAnalysisResult } from '@motif/schema';

export function useAnalyzeSvg() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (svgString: string): Promise<SvgAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ svgString }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze SVG');
      }

      const result = await response.json();
      return result as SvgAnalysisResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze SVG';
      setError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyze, isAnalyzing, error };
} 