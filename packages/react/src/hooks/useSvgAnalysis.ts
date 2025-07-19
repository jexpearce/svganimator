import { useEffect, useState } from 'react';
import { analyzeSvg } from '@motif/analysis';
import type { SvgAnalysisResult } from '@motif/schema';

// Module-level cache to prevent duplicate analysis
const analysisCache = new Map<string, Promise<SvgAnalysisResult>>();

/**
 * Custom hook that memoizes SVG analysis by content
 */
export function useSvgAnalysis(svgString: string): {
  data: SvgAnalysisResult | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<SvgAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use SVG string directly as cache key
        let resultPromise = analysisCache.get(svgString);
        
        if (!resultPromise) {
          resultPromise = analyzeSvg(svgString);
          analysisCache.set(svgString, resultPromise);
        }
        
        const result = await resultPromise;
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Analysis failed'));
          // Remove failed analysis from cache
          analysisCache.delete(svgString);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    analyze();
    
    return () => {
      cancelled = true;
    };
  }, [svgString]);
  
  return { data, loading, error };
} 