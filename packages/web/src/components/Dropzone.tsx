'use client';

import { useCallback, useState } from 'react';
import { Upload, FileX } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useAnalyzeSvg } from '@/hooks/useAnalyzeSvg';
import { cn, formatFileSize, isValidSvg } from '@/lib/utils';

const MAX_FILE_SIZE = 500 * 1024; // 500KB

function isSyntheticFile(f: File) {
  return f.size === 0 && f.lastModified === 0;
}

export function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const { setSvgString, setSvgMeta, setIsUploading, setError } = useAppStore();
  const { analyze } = useAnalyzeSvg();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.svg')) {
      setError('Please upload an SVG file');
      return;
    }

    if (!isSyntheticFile(file) && file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      
      if (!isValidSvg(text)) {
        throw new Error('Invalid SVG file');
      }

      // Analyze the SVG
      const analysis = await analyze(text);
      
      if (!analysis) {
        throw new Error('Failed to analyze SVG');
      }
      
      setSvgString(text);
      setSvgMeta(analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process SVG');
    } finally {
      setIsUploading(false);
    }
  }, [setSvgString, setSvgMeta, setIsUploading, setError, analyze]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const error = useAppStore((state) => state.error);
  const isUploading = useAppStore((state) => state.isUploading);

  return (
    <div className="w-full">
      <label
        htmlFor="svg-upload"
        className={cn(
          "relative block w-full rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all",
          isDragging
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 hover:border-gray-400",
          error && "border-red-300 bg-red-50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id="svg-upload"
          name="svg-upload"
          type="file"
          className="sr-only"
          accept=".svg"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          {error ? (
            <FileX className="mx-auto h-12 w-12 text-red-400" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <span>Processing SVG...</span>
            ) : error ? (
              <span className="text-red-600">{error}</span>
            ) : (
              <>
                <span className="font-semibold text-brand-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </>
            )}
          </div>
          
          {!error && !isUploading && (
            <p className="text-xs text-gray-500">
              SVG files up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
          )}
        </div>
      </label>
      
      {/* Sample SVGs for testing */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Or try one of these sample SVGs:
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              const sampleSvg = `<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80" fill="#3B82F6"/>
</svg>`;
              handleFile(new File([sampleSvg], 'circle.svg', { type: 'image/svg+xml' }));
            }}
            className="text-sm px-4 py-2 bg-white border rounded-md hover:bg-gray-50"
          >
            Simple Circle
          </button>
          
          <button
            onClick={() => {
              const sampleSvg = `<svg width="200" height="200" viewBox="0 0 200 200">
  <g id="logo">
    <rect x="40" y="40" width="40" height="40" fill="#EF4444"/>
    <rect x="120" y="40" width="40" height="40" fill="#10B981"/>
    <rect x="40" y="120" width="40" height="40" fill="#F59E0B"/>
    <rect x="120" y="120" width="40" height="40" fill="#6366F1"/>
  </g>
</svg>`;
              handleFile(new File([sampleSvg], 'structured.svg', { type: 'image/svg+xml' }));
            }}
            className="text-sm px-4 py-2 bg-white border rounded-md hover:bg-gray-50"
          >
            Structured Logo
          </button>
          
          <button
            onClick={() => {
              const sampleSvg = `<svg width="200" height="200" viewBox="0 0 200 200">
  <path d="M40,100 L100,40 L160,100" stroke="#8B5CF6" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="100" cy="140" r="30" stroke="#8B5CF6" stroke-width="6" fill="none"/>
</svg>`;
              handleFile(new File([sampleSvg], 'stroke.svg', { type: 'image/svg+xml' }));
            }}
            className="text-sm px-4 py-2 bg-white border rounded-md hover:bg-gray-50"
          >
            Stroke-based
          </button>
        </div>
      </div>
    </div>
  );
} 