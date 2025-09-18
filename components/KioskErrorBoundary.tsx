'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class KioskErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kiosk Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring (in production, send to logging service)
    this.logError(error, errorInfo);

    // Auto-retry after delay
    this.scheduleRetry();
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to logging service
    console.error('Error logged:', errorData);
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('kiosk-errors') || '[]');
      existingErrors.push(errorData);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('kiosk-errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e);
    }
  };

  private scheduleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.error('Max retry attempts reached. Manual intervention required.');
      return;
    }

    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }, this.retryDelay);
  };

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  private handleFullRestart = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="kiosk-container flex flex-col items-center justify-center p-8 bg-red-50">
          <div className="text-center max-w-2xl">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-red-800 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-lg text-red-600 mb-6">
              The application encountered an unexpected error. 
              {this.state.retryCount < this.maxRetries && (
                <span className="block mt-2">
                  Attempting to recover automatically in a few seconds...
                </span>
              )}
            </p>

            {/* Retry Information */}
            {this.state.retryCount > 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p className="text-sm">
                  Retry attempt: {this.state.retryCount} of {this.maxRetries}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleManualRetry}
                className="kiosk-button bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleFullRestart}
                className="kiosk-button bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                Restart App
              </button>
            </div>

            {/* Technical Details (for debugging) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-64">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
