/**
 * AdMimic API Service
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
    } else if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.detail || 'Server error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request made but no response received
      toast.error('Unable to connect to AdMimic services. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Service Object
 */
const apiService = {
  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  },

  /**
   * Validate image file before upload
   */
  async validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeMB = 10;
    
    if (!file) {
      return { valid: false, errors: ['No file provided'] };
    }
    
    const errors = [];
    
    // Check file type
    if (!validTypes.includes(file.type)) {
      errors.push('Please upload a valid image file (JPEG, PNG, or WebP)');
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      size: sizeMB
    };
  },

  /**
   * Step 1: Analyze uploaded ad
   */
  async analyzeAd(adImageFile) {
    try {
      const formData = new FormData();
      formData.append('ad_image', adImageFile);
      
      const response = await api.post('/analyze-ad', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Ad analysis failed:', error);
      throw error;
    }
  },

  /**
   * Step 2: Process brand assets
   */
  async processBrandAssets(sessionId, assets) {
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      // Product image is REQUIRED
      if (!assets.productImage) {
        throw new Error('Product image is required');
      }
      formData.append('product_image', assets.productImage);
      
      // Logo is OPTIONAL
      if (assets.logo) {
        formData.append('logo', assets.logo);
      }
      
      // Primary color is REQUIRED
      if (!assets.primaryColor) {
        throw new Error('Primary color is required');
      }
      formData.append('primary_color', assets.primaryColor);
      
      // Secondary color is optional
      if (assets.secondaryColor) {
        formData.append('secondary_color', assets.secondaryColor);
      }
      
      // Company name is optional
      if (assets.companyName) {
        formData.append('company_name', assets.companyName);
      }
      
      const response = await api.post('/process-brand-assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Brand assets upload progress: ${progress}%`);
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Brand asset processing failed:', error);
      throw error;
    }
  },

  /**
   * Step 3: Generate final ad
   */
  async generateAd(generationRequest) {
    try {
      const response = await api.post('/generate-ad', generationRequest, {
        timeout: 120000, // 2 minutes for AI generation
      });
      
      return response.data;
    } catch (error) {
      console.error('Ad generation failed:', error);
      throw error;
    }
  },

  /**
   * Download generated ad
   */
  async downloadAd(sessionId) {
    try {
      const response = await api.get(`/download-ad/${sessionId}`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admimic-generated-ad-${sessionId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Ad download failed:', error);
      throw error;
    }
  },

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      const response = await api.get(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Session status check failed:', error);
      throw error;
    }
  },

  /**
   * Clean up session
   */
  async cleanupSession(sessionId) {
    try {
      const response = await api.delete(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Session cleanup failed:', error);
      // Don't throw error for cleanup failures
      return { success: false };
    }
  },

  /**
   * Upload progress tracking
   */
  createUploadProgressTracker(onProgress) {
    return {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };
  },

  /**
   * Utility: Create form data from object
   */
  createFormData(data) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    return formData;
  },

  /**
   * Utility: Handle API errors consistently
   */
  handleApiError(error, customMessage = null) {
    let message = customMessage || 'An error occurred';
    
    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }
    
    console.error('API Error:', {
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    toast.error(message);
    return { success: false, error: message };
  },

  /**
   * Utility: Format file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Utility: Check if file is valid image type
   */
  isValidImageType(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * Utility: Get file extension
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  },

  /**
   * Utility: Create object URL for file preview
   */
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  },

  /**
   * Utility: Revoke object URL to prevent memory leaks
   */
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  },

  /**
   * Utility: Validate hex color format
   */
  validateHexColor(color) {
    if (!color) return { valid: false, error: 'Color is required' };
    
    // Remove # if present
    const cleanColor = color.replace('#', '');
    
    // Check if valid hex (3 or 6 characters)
    const hexRegex = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;
    
    if (!hexRegex.test(cleanColor)) {
      return { 
        valid: false, 
        error: 'Please enter a valid hex color (e.g., #FF0000 or #F00)' 
      };
    }
    
    return { valid: true, color: `#${cleanColor}` };
  },

  /**
   * Utility: Convert RGB to Hex
   */
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },

  /**
   * Utility: Convert Hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Utility: Validate image file for brand assets
   */
  validateBrandAsset(file, type = 'image') {
    if (!file) return { valid: false, error: 'No file provided' };
    
    const errors = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeMB = 10;
    
    // Check file type
    if (!validTypes.includes(file.type)) {
      errors.push(`Please upload a valid ${type} file (JPEG, PNG, or WebP)`);
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      errors.push(`${type} size must be less than ${maxSizeMB}MB`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      size: sizeMB
    };
  },

  /**
   * Utility: Validate complete brand assets before submission
   */
  validateBrandAssetsForSubmission(assets) {
    const errors = [];
    
    // Product image is REQUIRED
    if (!assets.productImage) {
      errors.push('Product image is required');
    } else {
      const productValidation = this.validateBrandAsset(assets.productImage, 'product image');
      if (!productValidation.valid) {
        errors.push(...productValidation.errors);
      }
    }
    
    // Logo is OPTIONAL - only validate if provided
    if (assets.logo) {
      const logoValidation = this.validateBrandAsset(assets.logo, 'logo');
      if (!logoValidation.valid) {
        errors.push(...logoValidation.errors);
      }
    }
    
    // Primary color is REQUIRED
    if (!assets.primaryColor) {
      errors.push('Primary color is required');
    } else {
      const colorValidation = this.validateHexColor(assets.primaryColor);
      if (!colorValidation.valid) {
        errors.push(colorValidation.error);
      }
    }
    
    // Secondary color is optional - only validate if provided
    if (assets.secondaryColor) {
      const colorValidation = this.validateHexColor(assets.secondaryColor);
      if (!colorValidation.valid) {
        errors.push(`Secondary color: ${colorValidation.error}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Utility: Generate color palette suggestions
   */
  generateColorPalette(primaryColor) {
    try {
      const rgb = this.hexToRgb(primaryColor);
      if (!rgb) return [primaryColor];
      
      // Generate complementary and analogous colors
      const suggestions = [
        primaryColor,
        this.rgbToHex(Math.min(255, rgb.r + 30), Math.max(0, rgb.g - 30), rgb.b),
        this.rgbToHex(Math.max(0, rgb.r - 30), Math.min(255, rgb.g + 30), rgb.b),
        this.rgbToHex(rgb.r, rgb.g, Math.min(255, rgb.b + 40)),
      ];
      
      return suggestions;
    } catch (error) {
      return [primaryColor];
    }
  },
};

export default apiService; 