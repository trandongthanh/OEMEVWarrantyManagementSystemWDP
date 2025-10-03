"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "Dashboard Error Boundary caught an error:",
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full text-center"
            >
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="flex justify-center mb-6"
                >
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-4">
                  Oops! Something went wrong
                </h1>

                <p className="text-gray-300 mb-6">
                  We encountered an unexpected error in the dashboard. Our team
                  has been notified and is working on a fix.
                </p>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mb-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-white mb-2">
                      Error Details (Dev Mode)
                    </summary>
                    <pre className="text-xs text-red-300 bg-black/20 p-3 rounded-lg overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reload Page</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/")}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                  >
                    <Home className="w-4 h-4" />
                    <span>Go Home</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
