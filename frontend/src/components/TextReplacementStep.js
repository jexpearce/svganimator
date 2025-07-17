/**
 * TextReplacementStep Component
 * Allows users to customize text content before generating the final ad
 */

import React, { useState, useEffect } from 'react';
import { Type, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const TextReplacementStep = ({ analysis, brandAssets, onGenerate, error }) => {
  const [textReplacements, setTextReplacements] = useState({});
  const [companyName, setCompanyName] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(true);

  // Extract text elements from analysis
  const textElements = analysis?.structure?.elements?.filter(
    element => element.type === 'text' || element.type === 'button'
  ) || [];

  // Initialize text replacements
  useEffect(() => {
    const initialReplacements = {};
    textElements.forEach(element => {
      initialReplacements[element.id] = element.content;
    });
    setTextReplacements(initialReplacements);
  }, [analysis]);

  // Handle text change
  const handleTextChange = (elementId, newText) => {
    setTextReplacements(prev => ({
      ...prev,
      [elementId]: newText
    }));

    // Clear validation error for this field
    if (validationErrors[elementId]) {
      setValidationErrors(prev => ({
        ...prev,
        [elementId]: null
      }));
    }
  };

  // Handle company name change
  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Check for empty required fields
    textElements.forEach(element => {
      const newText = textReplacements[element.id]?.trim();
      if (!newText) {
        errors[element.id] = 'This field is required';
      } else if (newText.length > 100) {
        errors[element.id] = 'Text must be 100 characters or less';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Only include changed text
      const changedText = {};
      textElements.forEach(element => {
        const newText = textReplacements[element.id]?.trim();
        if (newText && newText !== element.content) {
          changedText[element.id] = newText;
        }
      });

      onGenerate(changedText, companyName.trim());
    }
  };

  // Get element type label
  const getElementTypeLabel = (element) => {
    switch (element.type) {
      case 'button':
        return 'Call-to-Action Button';
      case 'text':
        if (element.design_purpose?.toLowerCase().includes('headline')) {
          return 'Headline';
        } else if (element.design_purpose?.toLowerCase().includes('tagline')) {
          return 'Tagline';
        } else if (element.design_purpose?.toLowerCase().includes('description')) {
          return 'Description';
        }
        return 'Text Element';
      default:
        return 'Text';
    }
  };

  // Get suggested text based on element purpose
  const getSuggestedText = (element) => {
    const type = element.type;
    const purpose = element.design_purpose?.toLowerCase() || '';
    
    if (type === 'button') {
      return ['Shop Now', 'Learn More', 'Get Started', 'Buy Now', 'Sign Up'];
    } else if (purpose.includes('headline')) {
      return ['Transform Your Business', 'Discover the Difference', 'Your Solution Awaits'];
    } else if (purpose.includes('tagline')) {
      return ['Quality You Can Trust', 'Innovation Redefined', 'Excellence Delivered'];
    }
    
    return [];
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Customize Your Ad Text
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Replace the original text with your own messaging while preserving the design's effectiveness.
          We'll maintain the visual hierarchy and impact.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Brand Assets Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
                Your Brand Setup
              </h3>
              
              <div className="space-y-4">
                {/* Brand Colors */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Brand Colors</p>
                  <div className="flex space-x-2">
                    {brandAssets?.brand_colors?.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-lg border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Assets Status */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Logo variants:</span>
                    <span className="text-gray-900 font-medium">
                      {brandAssets?.logo_variants?.length || 0}
                    </span>
                  </div>
                  {brandAssets?.product_variants?.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Product images:</span>
                      <span className="text-gray-900 font-medium">
                        {brandAssets.product_variants.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Design Strategy */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Design Focus</p>
                  <p className="text-sm text-gray-600">
                    {analysis?.structure?.design_strategy?.primary_emotion || 'Professional'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Customization */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Company Name */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={handleCompanyNameChange}
                    placeholder="Your Company Name"
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This helps the AI make better design decisions
                  </p>
                </div>
              </div>

              {/* Text Elements */}
              {textElements.map((element, index) => {
                const suggestions = getSuggestedText(element);
                
                return (
                  <div key={element.id} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Type className="w-5 h-5 text-primary-600 mr-2" />
                          {getElementTypeLabel(element)}
                        </h3>
                        {element.design_purpose && (
                          <p className="text-sm text-gray-600 mt-1">
                            {element.design_purpose}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Element {index + 1}
                      </span>
                    </div>

                    {/* Original vs New */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Original Text
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-gray-700">{element.content}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Text *
                        </label>
                        <textarea
                          value={textReplacements[element.id] || ''}
                          onChange={(e) => handleTextChange(element.id, e.target.value)}
                          placeholder="Enter your text here..."
                          rows={3}
                          className={`form-textarea w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none ${
                            validationErrors[element.id] 
                              ? 'border-error-300 focus:border-error-500' 
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                        />
                        {validationErrors[element.id] && (
                          <div className="flex items-center space-x-2 text-error-600 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{validationErrors[element.id]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTextChange(element.id, suggestion)}
                              className="px-3 py-1 text-sm bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* No text elements message */}
              {textElements.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Text Elements Found</h3>
                  <p className="text-gray-600">
                    This ad appears to be primarily visual. You can proceed to generate your branded version.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-error-700 font-medium">Generation Error</p>
              <p className="text-error-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate My Ad</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Generation Info */}
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Generation Process
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-primary-700">
              <p className="font-medium mb-1">Design Adaptation</p>
              <p>Preserve visual hierarchy and psychological impact</p>
            </div>
            <div className="text-primary-700">
              <p className="font-medium mb-1">Brand Integration</p>
              <p>Apply your assets while maintaining effectiveness</p>
            </div>
            <div className="text-primary-700">
              <p className="font-medium mb-1">Quality Rendering</p>
              <p>Generate high-resolution, print-ready output</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextReplacementStep;