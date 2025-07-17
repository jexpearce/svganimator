/**
 * AdUploadStep Component
 * Handles upload and validation of the inspiration ad
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const AdUploadStep = ({ onUpload, error }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Clear previous state
    setSelectedFile(null);
    setFileInfo(null);
    setValidationError('');

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setValidationError('File size must be less than 10MB');
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        setValidationError('Please upload a JPG, PNG, or WebP image');
      } else {
        setValidationError('Invalid file. Please try another image.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    try {
      setIsValidating(true);
      
      // Validate file with API service
      const validation = await apiService.validateImageFile(file);
      
      if (validation.valid) {
        setSelectedFile(file);
        setFileInfo(validation.info);
        setValidationError('');
      } else {
        setValidationError(validation.errors.join(' '));
      }
    } catch (error) {
      setValidationError('Error validating file. Please try again.');
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Handle upload
  const handleUpload = () => {
    if (selectedFile && !validationError) {
      onUpload(selectedFile);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setValidationError('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Inspiration Ad
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose an advertisement that you find effective and want to recreate with your brand. 
          Our AI will analyze its design psychology and structure.
        </p>
      </div>

      {/* Upload Area */}
      {!selectedFile ? (
        <div className="max-w-2xl mx-auto">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${isDragActive && !isDragReject 
                ? 'border-primary-400 bg-primary-50' 
                : isDragReject 
                ? 'border-error-400 bg-error-50'
                : 'border-gray-300 bg-gray-50 hover:border-primary-300 hover:bg-primary-25'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {isValidating ? (
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4" />
                <p className="text-primary-600 font-medium">Validating image...</p>
              </div>
            ) : (
              <>
                <Upload 
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDragActive ? 'text-primary-500' : 'text-gray-400'
                  }`} 
                />
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your ad here' : 'Drop your ad image here'}
                  </p>
                  <p className="text-gray-500">
                    or{' '}
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      browse files
                    </span>
                  </p>
                </div>
                
                <div className="mt-6 text-sm text-gray-500 space-y-1">
                  <p>Supported formats: JPG, PNG, WebP</p>
                  <p>Maximum size: 10MB</p>
                  <p>Recommended: High-quality ad images for best analysis</p>
                </div>
              </>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error-700 font-medium">Upload Error</p>
                <p className="text-error-600 text-sm">{validationError}</p>
              </div>
            </div>
          )}

          {/* API Error */}
          {error && (
            <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error-700 font-medium">Analysis Error</p>
                <p className="text-error-600 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* File Preview */
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {apiService.formatFileSize(selectedFile.size)}
                      {fileInfo && (
                        <span> • {fileInfo.width}×{fileInfo.height}px</span>
                      )}
                    </p>
                  </div>
                  
                  <button
                    onClick={removeFile}
                    className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Success Message */}
                <div className="mt-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600 font-medium">
                    Ready to analyze
                  </span>
                </div>
              </div>
            </div>
            
            {/* Image Preview */}
            <div className="mt-6">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Ad preview"
                className="w-full h-64 object-contain bg-white border border-gray-200 rounded-lg"
              />
            </div>
          </div>
          
          {/* Upload Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              Analyze This Ad
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Tips for Best Results
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">High Quality</h4>
            <p className="text-sm text-gray-600">Upload clear, high-resolution images for better analysis</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Effective Ads</h4>
            <p className="text-sm text-gray-600">Choose ads that you find compelling and well-designed</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Clear Text</h4>
            <p className="text-sm text-gray-600">Ensure text elements are readable for accurate analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdUploadStep;