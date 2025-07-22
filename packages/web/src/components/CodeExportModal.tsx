'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Copy, Check } from 'lucide-react';
import copy from 'copy-to-clipboard';
import { useAppStore } from '@/store/app-store';
import { generateCssAnimation, generateReactCode, generateVueCode, cn } from '@/lib/utils';

const tabs = [
  { id: 'css', label: 'CSS' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
] as const;

type TabId = typeof tabs[number]['id'];

export function CodeExportModal() {
  const { exportModalOpen, setExportModalOpen, animationConfig, svgMeta } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('css');
  const [copied, setCopied] = useState(false);

  if (!animationConfig) return null;

  const getCode = (tab: TabId) => {
    const elementCount = svgMeta ? Object.values(svgMeta.metadata.nodeCount).reduce((sum, count) => sum + count, 0) : 10;
    
    switch (tab) {
      case 'css':
        return generateCssAnimation(animationConfig, elementCount);
      case 'react':
        return generateReactCode(animationConfig);
      case 'vue':
        return generateVueCode(animationConfig);
    }
  };

  const handleCopy = () => {
    const code = getCode(activeTab);
    copy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Transition.Root show={exportModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setExportModalOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setExportModalOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                        Export Animation Code
                      </Dialog.Title>
                      
                      {/* Tab selector */}
                      <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 mb-4">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                              activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Code display */}
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto custom-scrollbar">
                          <code className="text-sm">{getCode(activeTab)}</code>
                        </pre>
                        
                        <button
                          onClick={handleCopy}
                          className={cn(
                            "absolute top-2 right-2 p-2 rounded-md transition-colors",
                            copied
                              ? "bg-green-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          )}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Instructions */}
                      <div className="mt-4 text-sm text-slate-600">
                        {activeTab === 'css' && (
                          <p>Add this CSS to your stylesheet and apply the <code className="bg-slate-100 px-1 rounded">.animated-element</code> class to your SVG.</p>
                        )}
                        {activeTab === 'react' && (
                          <p>Install <code className="bg-slate-100 px-1 rounded">@motif/react</code> and use this component in your React app.</p>
                        )}
                        {activeTab === 'vue' && (
                          <p>Install <code className="bg-slate-100 px-1 rounded">@motif/analysis</code> and <code className="bg-slate-100 px-1 rounded">@motif/primitives</code> for Vue integration.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 