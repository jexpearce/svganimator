/**
 * AdMimic Main Application Component
 * Orchestrates the complete ad transformation workflow
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Import step components
import AdUploadStep from './components/AdUploadStep';
import BrandAssetsStep from './components/BrandAssetsStep';
import TextReplacementStep from './components/TextReplacementStep';
import FinalAdStep from './components/FinalAdStep';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Import services
import apiService from './services/api';

// Import styles
import './App.css';

function App() {
  // Application state
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Step data
  const [adAnalysis, setAdAnalysis] = useState(null);
  const [brandAssets, setBrandAssets] = useState(null);
  const [generatedAd, setGeneratedAd] = useState(null);

  // Error handling
  const [error, setError] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Connecting to AdMimic services...');
      
      const health = await apiService.healthCheck();
      
      if (!health.services?.gpt_analyzer || !health.services?.ad_generator) {
        toast.error('AI services not available. Please check API configuration.');
      } else {
        console.log('✅ Backend services healthy');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      toast.error('Unable to connect to AdMimic services. Please try again later.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Step 1: Handle ad upload and analysis
  const handleAdUpload = async (file) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Analyzing your ad with AI...');
      setError(null);

      // Validate file
      const validation = await apiService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(' '));
      }

      // Analyze ad with GPT-4o
      const result = await apiService.analyzeAd(file);
      
      if (result.success) {
        setAdAnalysis(result);
        setSessionId(result.session_id);
        setCurrentStep(2);
        toast.success('Ad analysis complete! Upload your brand assets.');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Ad upload failed:', error);
      setError(`Analysis failed: ${error.message}`);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Step 2: Handle brand assets processing
  const handleBrandAssetsSubmit = async (assetsData) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Processing your brand assets...');
      setError(null);

      // Validate assets (product image is required, logo is optional)
      if (!assetsData.productImage) {
        throw new Error('Product image is required');
      }

      if (!apiService.validateHexColor(assetsData.primaryColor)) {
        throw new Error('Invalid color format');
      }

      // Process brand assets
      const result = await apiService.processBrandAssets(sessionId, assetsData);

      if (result.success) {
        setBrandAssets(result);
        setCurrentStep(3);
        toast.success('Brand assets processed! Customize your text.');
      } else {
        throw new Error(result.error || 'Brand asset processing failed');
      }
    } catch (error) {
      console.error('Brand assets processing failed:', error);
      setError(`Brand processing failed: ${error.message}`);
      toast.error(`Brand processing failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Step 3: Handle ad generation
  const handleAdGeneration = async (textReplacements, companyName) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Generating your branded ad with AI...');
      setError(null);

      // Generate new ad
      const result = await apiService.generateAd({
        originalStructure: adAnalysis.structure,
        brandAssetIds: { session_id: sessionId },
        textReplacements: textReplacements,
        primaryColor: brandAssets.brand_colors?.[0] || '#000000',
        companyName: companyName
      });

      if (result.success) {
        setGeneratedAd(result);
        setCurrentStep(4);
        toast.success('Your branded ad is ready!');
      } else {
        throw new Error(result.error || 'Ad generation failed');
      }
    } catch (error) {
      console.error('Ad generation failed:', error);
      setError(`Generation failed: ${error.message}`);
      toast.error(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      await apiService.downloadAd(sessionId, 'admimiced-ad.png');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Handle restart
  const handleRestart = () => {
    // Cleanup session
    if (sessionId) {
      apiService.cleanupSession(sessionId).catch(console.error);
    }

    // Reset state
    setCurrentStep(1);
    setSessionId(null);
    setAdAnalysis(null);
    setBrandAssets(null);
    setGeneratedAd(null);
    setError(null);
    
    toast.success('Ready to create another ad!');
  };

  // Handle step navigation
  const goToStep = (step) => {
    if (step <= currentStep || (step === 2 && adAnalysis) || (step === 3 && brandAssets)) {
      setCurrentStep(step);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Upload Ad', completed: !!adAnalysis },
      { number: 2, title: 'Brand Assets', completed: !!brandAssets },
      { number: 3, title: 'Customize Text', completed: !!generatedAd },
      { number: 4, title: 'Download', completed: false }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                  currentStep === step.number
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : step.completed
                    ? 'border-success-500 bg-success-500 text-white'
                    : currentStep > step.number
                    ? 'border-primary-300 bg-primary-100 text-primary-700 hover:border-primary-500'
                    : 'border-gray-300 bg-gray-100 text-gray-500'
                }`}
                onClick={() => goToStep(step.number)}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${
                  step.completed ? 'bg-success-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-center mt-3">
          <span className="text-sm font-medium text-gray-600">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <AdUploadStep 
            onUpload={handleAdUpload}
            error={error}
          />
        );
      case 2:
        return (
          <BrandAssetsStep
            analysis={adAnalysis}
            onSubmit={handleBrandAssetsSubmit}
            error={error}
          />
        );
      case 3:
        return (
          <TextReplacementStep
            analysis={adAnalysis}
            brandAssets={brandAssets}
            onGenerate={handleAdGeneration}
            error={error}
          />
        );
      case 4:
        return (
          <FinalAdStep
            generatedAd={generatedAd}
            onDownload={handleDownload}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AM</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AdMimic</h1>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-sm text-gray-500">
                  Transform any ad into your branded version
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          {renderStepIndicator()}
          
          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
            {renderStepContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">
              Powered by GPT-4o design intelligence • Built with React & FastAPI
            </p>
          </div>
        </footer>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 25px 0 rgba(0, 0, 0, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;