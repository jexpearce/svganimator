/**
 * LoadingSpinner Component
 * Displays loading states with custom messages and animations
 */

import React from 'react';
import { Loader2, Sparkles, Zap, Brain } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', showDetails = true }) => {
  // Different loading messages for different stages
  const getLoadingIcon = () => {
    if (message.toLowerCase().includes('analyzing')) {
      return <Brain className="w-8 h-8 text-primary-600 animate-pulse" />;
    } else if (message.toLowerCase().includes('generating')) {
      return <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />;
    } else if (message.toLowerCase().includes('processing')) {
      return <Zap className="w-8 h-8 text-primary-600 animate-pulse" />;
    }
    return <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />;
  };

  const getLoadingDetails = () => {
    if (message.toLowerCase().includes('analyzing')) {
      return {
        title: 'AI Analysis in Progress',
        description: 'GPT-4o is analyzing the design psychology and structure of your ad',
        steps: [
          'Understanding visual hierarchy',
          'Identifying design elements', 
          'Analyzing color psychology',
          'Extracting effectiveness factors'
        ]
      };
    } else if (message.toLowerCase().includes('processing')) {
      return {
        title: 'Processing Brand Assets',
        description: 'Creating optimized variants and extracting brand colors',
        steps: [
          'Removing backgrounds',
          'Creating logo variants',
          'Extracting color palette',
          'Optimizing images'
        ]
      };
    } else if (message.toLowerCase().includes('generating')) {
      return {
        title: 'Generating Your Ad',
        description: 'AI is adapting the design with your brand while preserving effectiveness',
        steps: [
          'Applying brand identity',
          'Adapting design strategy',
          'Positioning elements',
          'Rendering final image'
        ]
      };
    }
    
    return {
      title: 'Processing',
      description: 'Please wait while we handle your request',
      steps: []
    };
  };

  const details = getLoadingDetails();

  return (
    <div className="flex items-center justify-center min-h-96 p-8">
      <div className="text-center max-w-md mx-auto">
        {/* Main Loading Icon */}
        <div className="mb-6">
          {getLoadingIcon()}
        </div>

        {/* Loading Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {details.title}
        </h3>
        <p className="text-gray-600 mb-6">
          {details.description}
        </p>

        {/* Current Message */}
        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse mr-3"></div>
            <span className="text-primary-700 font-medium text-sm">{message}</span>
          </div>
        </div>

        {/* Progress Steps */}
        {showDetails && details.steps.length > 0 && (
          <div className="text-left">
            <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Processing Steps
            </h4>
            <div className="space-y-2">
              {details.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-primary-300 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm text-gray-600">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-xs text-gray-500">
          {message.toLowerCase().includes('analyzing') && 'Usually takes 15-30 seconds'}
          {message.toLowerCase().includes('processing') && 'Usually takes 10-20 seconds'}  
          {message.toLowerCase().includes('generating') && 'Usually takes 30-60 seconds'}
          {!message.toLowerCase().includes('analyzing') && 
           !message.toLowerCase().includes('processing') && 
           !message.toLowerCase().includes('generating') && 'Please wait...'}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;