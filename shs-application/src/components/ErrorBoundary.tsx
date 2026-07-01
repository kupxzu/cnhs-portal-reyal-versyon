import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Our team has been notified.
              </p>

              {/* Error Details (Development Only) */}
              {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
                <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-600 break-words">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <Link to="/dashboard" className="w-full">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
                <Link to="/" className="w-full">
                  <button className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors">
                    Go Home
                  </button>
                </Link>
              </div>
            </div>

            {/* Footer Help Text */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                If this problem persists, please contact support at{' '}
                <span className="font-semibold">support@portal.com</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
