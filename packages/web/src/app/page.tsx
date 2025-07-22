'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { Dropzone } from '@/components/Dropzone';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeExportModal } from '@/components/CodeExportModal';
import { Header } from '@/components/Header';

export default function HomePage() {
  const { svgString, exportModalOpen } = useAppStore();
  const [debugMode, setDebugMode] = useState(false);

  // Check for debug mode from URL params
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true' && !debugMode) {
      setDebugMode(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!svgString ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Bring Your SVG to Life
              </h1>
              <p className="text-lg text-slate-600">
                Upload an SVG, describe how you want it animated, and get production-ready code
              </p>
            </div>
            <Dropzone />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <div className="space-y-6">
              <PreviewPanel />
              <div className="text-center">
                <button
                  onClick={() => useAppStore.getState().reset()}
                  className="text-sm text-slate-600 hover:text-slate-900 underline"
                >
                  Upload a different SVG
                </button>
              </div>
            </div>
            <div>
              <ControlPanel />
            </div>
          </div>
        )}
      </main>
      
      {exportModalOpen && <CodeExportModal />}
      
      {debugMode && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs font-mono max-w-sm">
          <div className="font-bold mb-2">Debug Mode</div>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(useAppStore.getState(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 