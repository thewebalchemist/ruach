// components/ErrorBoundary.tsx
// Global error boundary — catches unexpected render errors and shows graceful fallback

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RuachConnect ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808] p-6">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-[#BF0A30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                An unexpected error occurred. This has been noted.
                Please try again or return to the dashboard.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="px-4 py-2 bg-[#BF0A30] text-white rounded-xl text-sm font-semibold hover:bg-[#B00325] transition-colors"
                >
                  Go to home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-gray-400 cursor-pointer font-medium">
                    Developer details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 dark:bg-[#111] p-3 rounded-xl overflow-auto text-red-600 dark:text-red-400 border border-gray-200 dark:border-[#2D2D2D]">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack?.split('\n').slice(0, 6).join('\n')}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
