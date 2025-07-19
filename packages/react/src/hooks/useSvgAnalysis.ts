import { useEffect, useState, useMemo } from 'react';
import { analyzeSvg } from '@motif/analysis';
import type { SvgAnalysisResult } from '@motif/schema';

// Module-level cache to prevent duplicate analysis
const analysisCache = new Map<string, Promise<SvgAnalysisResult>>();

/**
 * Custom hook that memoizes SVG analysis by content hash
 */
export function useSvgAnalysis(svgString: string): {
  data: SvgAnalysisResult | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<SvgAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Simple hash function for memoization
  const svgHash = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < svgString.length; i++) {
      const char = svgString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }, [svgString]);
  
  useEffect(() => {
    let cancelled = false;
    
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cacheKey = svgHash;
        let resultPromise = analysisCache.get(cacheKey);
        
        if (!resultPromise) {
          resultPromise = analyzeSvg(svgString);
          analysisCache.set(cacheKey, resultPromise);
        }
        
        const result = await resultPromise;
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Analysis failed'));
          // Remove failed analysis from cache
          analysisCache.delete(svgHash);
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
  }, [svgHash, svgString]);
  
  return { data, loading, error };
} 