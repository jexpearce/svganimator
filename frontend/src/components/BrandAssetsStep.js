/**
 * BrandAssetsStep Component
 * Handles upload and processing of brand assets (logo, product, colors)
 */

import React, { useState } from 'react';
import { Upload, Image, AlertCircle, CheckCircle, Eye, Palette, Zap } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import apiService from '../services/api';

const BrandAssetsStep = ({ analysis, onSubmit, error }) => {
  const [logo, setLogo] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [validationErrors, setValidationErrors] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Logo dropzone
  const logoDropzone = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          logo: 'Invalid logo file. Please upload PNG, JPG, SVG, or WebP.'
        }));
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validation = await apiService.validateImageFile(file);
        
        if (validation.valid) {
          setLogo(file);
          setValidationErrors(prev => ({ ...prev, logo: null }));
        } else {
          setValidationErrors(prev => ({
            ...prev,
            logo: validation.errors.join(' ')
          }));
        }
      }
    }
  });

  // Product image dropzone
  const productDropzone = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          product: 'Invalid product image. Please upload PNG, JPG, or WebP.'
        }));
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validation = await apiService.validateImageFile(file);
        
        if (validation.valid) {
          setProductImage(file);
          setValidationErrors(prev => ({ ...prev, product: null }));
        } else {
          setValidationErrors(prev => ({
            ...prev,
            product: validation.errors.join(' ')
          }));
        }
      }
    }
  });

  // Handle color change
  const handleColorChange = (e) => {
    const color = e.target.value;
    setPrimaryColor(color);
    
    if (!apiService.validateHexColor(color)) {
      setValidationErrors(prev => ({
        ...prev,
        color: 'Invalid color format'
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, color: null }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const errors = {};

    // Product image is REQUIRED, logo is optional
    if (!productImage) {
      errors.product = 'Product image is required';
    }

    if (!apiService.validateHexColor(primaryColor).valid) {
      errors.color = 'Valid primary color is required';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSubmit({
        logo,
        productImage,
        primaryColor
      });
    }
  };

  // Remove file
  const removeFile = (type) => {
    if (type === 'logo') {
      setLogo(null);
      setValidationErrors(prev => ({ ...prev, logo: null }));
    } else if (type === 'product') {
      setProductImage(null);
      setValidationErrors(prev => ({ ...prev, product: null }));
    }
  };

  // Render file upload area
  const renderFileUpload = (dropzone, file, type, required = false) => {
    const { getRootProps, getInputProps, isDragActive } = dropzone;
    const title = type === 'logo' ? 'Brand Logo' : 'Product Image';
    const description = type === 'logo' 
      ? 'Upload your company logo in high quality'
      : 'Upload a product image (optional)';

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {required && <span className="text-error-500 text-sm">*</span>}
        </div>
        
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 bg-gray-50 hover:border-primary-300'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {isDragActive ? `Drop ${type} here` : `Upload ${type}`}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{apiService.formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(type)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Image Preview */}
            <div className="mt-3">
              <img
                src={URL.createObjectURL(file)}
                alt={`${type} preview`}
                className="w-full h-32 object-contain bg-white border border-gray-200 rounded"
              />
            </div>
          </div>
        )}
        
        {validationErrors[type] && (
          <div className="flex items-center space-x-2 text-error-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{validationErrors[type]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Brand Assets
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Provide your brand assets so we can adapt the ad design to match your identity.
          We'll create optimized versions for different contexts.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis Summary */}
          <div className="lg:col-span-1">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-primary-900">Analysis Summary</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-primary-700 font-medium">Design Strategy:</p>
                  <p className="text-primary-600">
                    {analysis?.structure?.design_strategy?.primary_emotion || 'Professional and trustworthy'}
                  </p>
                </div>
                
                <div>
                  <p className="text-primary-700 font-medium">Elements Found:</p>
                  <p className="text-primary-600">
                    {analysis?.structure?.elements?.length || 0} design elements identified
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="text-primary-700 hover:text-primary-800 font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showAnalysis ? 'Hide' : 'View'} Details</span>
                </button>
                
                {showAnalysis && analysis?.analysis && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {analysis.analysis.substring(0, 300)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Logo Upload */}
            {renderFileUpload(logoDropzone, logo, 'logo', true)}

            {/* Product Image Upload */}
            {renderFileUpload(productDropzone, productImage, 'product')}

            {/* Color Picker */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Primary Brand Color</h3>
                <span className="text-error-500 text-sm">*</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={handleColorChange}
                    className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Palette className="w-4 h-4 text-gray-400 absolute -top-1 -right-1" />
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={handleColorChange}
                    placeholder="#000000"
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter hex color code (e.g., #FF0000)
                  </p>
                </div>
                
                <div 
                  className="w-16 h-16 rounded-lg border border-gray-300"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              
              {validationErrors.color && (
                <div className="flex items-center space-x-2 text-error-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.color}</span>
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
              <p className="text-error-700 font-medium">Processing Error</p>
              <p className="text-error-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!logo || validationErrors.logo || validationErrors.color}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Process Brand Assets
          </button>
        </div>

        {/* Processing Info */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Logo Processing</p>
                <p>Create transparent, monochrome, and optimized variants</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Background Removal</p>
                <p>AI-powered product image enhancement and cleanup</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Color Extraction</p>
                <p>Generate harmonious brand color palette</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetsStep;