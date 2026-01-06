import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We encountered an unexpected error. Please try reloading the application.
            </p>
            <button 
              onClick={this.handleReload}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
            <p className="mt-6 text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
               {this.state.error?.message}
            </p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}