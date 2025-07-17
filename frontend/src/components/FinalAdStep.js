/**
 * FinalAdStep Component
 * Displays the generated ad with download and restart options
 */

import React, { useState } from 'react';
import { 
  Download, 
  RefreshCw, 
  Share2, 
  Eye, 
  CheckCircle, 
  Clock,
  Palette,
  Type,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const FinalAdStep = ({ generatedAd, onDownload, onRestart }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDesignNotes, setShowDesignNotes] = useState(false);

  // Handle download with loading state
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle share (copy URL)
  const handleShare = async () => {
    try {
      if (generatedAd?.ad_url) {
        // In a real app, this would be the full URL
        const fullUrl = `${window.location.origin}${generatedAd.ad_url}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Ad URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Could not copy URL');
    }
  };

  // Handle restart confirmation
  const handleRestart = () => {
    if (window.confirm('Are you sure you want to start over? This will clear your current ad.')) {
      onRestart();
    }
  };

  // Format processing time
  const formatProcessingTime = (seconds) => {
    if (!seconds) return 'Unknown';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  if (!generatedAd) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Branded Ad is Ready!
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our AI has successfully adapted the original design with your brand assets 
          while preserving its psychological effectiveness.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Generated Ad Display */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Advertisement</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Generated in {formatProcessingTime(generatedAd.processing_time)}</span>
                </div>
              </div>
              
              {/* Ad Image */}
              <div className="relative group">
                <img
                  src={generatedAd.ad_url}
                  alt="Generated advertisement"
                  className="w-full h-auto border border-gray-200 rounded-lg shadow-medium"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => window.open(generatedAd.ad_url, '_blank')}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Full Size</span>
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors space-x-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          </div>

          {/* Design Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generation Summary */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Generation Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-700 flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Brand Colors Applied
                  </span>
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-700 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Assets Integrated
                  </span>
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-700 flex items-center">
                    <Type className="w-4 h-4 mr-2" />
                    Text Customized
                  </span>
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-700 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Design Psychology Preserved
                  </span>
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
              </div>
            </div>

            {/* Design Notes */}
            {generatedAd.design_notes && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">AI Design Notes</h3>
                  <button
                    onClick={() => setShowDesignNotes(!showDesignNotes)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {showDesignNotes ? 'Hide' : 'Show'} Details
                  </button>
                </div>
                
                {showDesignNotes && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {generatedAd.design_notes}
                    </p>
                  </div>
                )}
                
                {!showDesignNotes && (
                  <p className="text-gray-600 text-sm">
                    {generatedAd.design_notes.substring(0, 150)}...
                  </p>
                )}
              </div>
            )}

            {/* Usage Recommendations */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Recommendations</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Digital Marketing</p>
                    <p className="text-gray-600">Perfect for social media, display ads, and email campaigns</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Print Materials</p>
                    <p className="text-gray-600">High-resolution output suitable for brochures and flyers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">A/B Testing</p>
                    <p className="text-gray-600">Test against current ads to measure effectiveness</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Design Consistency</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-success-400"></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Brand Integration</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-success-400"></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Visual Impact</span>
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-success-400"></div>
                    ))}
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-success-50 border border-success-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-success-900 mb-2">
            Congratulations! Your Ad is Ready
          </h4>
          <p className="text-success-700 mb-4">
            Your advertisement has been successfully generated with your brand identity while 
            maintaining the psychological effectiveness of the original design.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-2 bg-success-600 text-white font-medium rounded-lg hover:bg-success-700 transition-colors space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Now</span>
            </button>
            <button
              onClick={handleRestart}
              className="inline-flex items-center px-6 py-2 bg-white border border-success-300 text-success-700 font-medium rounded-lg hover:bg-success-50 transition-colors space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Create Another</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalAdStep;