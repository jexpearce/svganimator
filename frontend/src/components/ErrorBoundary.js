/**
 * ErrorBoundary Component
 * Catches JavaScript errors in the component tree and displays fallback UI
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-error-600" />
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                We encountered an unexpected error. This is likely a temporary issue. 
                Try refreshing the page or starting over.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors space-x-2"
                >
                  <span>Try Again</span>
                </button>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                  <summary className="cursor-pointer font-medium text-gray-700 flex items-center space-x-2 mb-3">
                    <Bug className="w-4 h-4" />
                    <span>Error Details (Development)</span>
                  </summary>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Error:</h4>
                      <pre className="bg-error-50 border border-error-200 rounded p-3 text-error-700 overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Component Stack:</h4>
                        <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-gray-700 overflow-auto text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Help Information */}
              <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <h3 className="font-medium text-primary-900 mb-2">Need Help?</h3>
                <p className="text-sm text-primary-700">
                  If this problem persists, please check your internet connection and try again. 
                  Make sure your browser is up to date for the best experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;