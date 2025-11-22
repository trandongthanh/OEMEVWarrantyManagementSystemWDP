"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * SocketGuard - Ensures Socket.IO CDN is loaded before rendering children
 * This prevents the "Cannot read properties of undefined" error in production
 */
export default function SocketGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 150; // 15 seconds

    const checkSocketIO = async () => {
      // Check if socket.io is already available
      if (typeof window !== "undefined" && window.io) {
        if (mounted) {
          window.__SOCKET_IO_LOADED__ = true;
          setIsSocketReady(true);
        }
        return;
      }

      // Wait for socket.io to load
      while (attempts < maxAttempts && mounted) {
        if (window.io) {
          window.__SOCKET_IO_LOADED__ = true;
          setIsSocketReady(true);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;

        if (attempts % 20 === 0 && mounted) {
          console.log(`⏳ Waiting for Socket.IO CDN... (${attempts / 10}s)`);
        }
      }

      // Timeout
      if (mounted && !window.io) {
        console.error("❌ Socket.IO CDN failed to load");
        setError("Failed to load chat service. Please refresh the page.");
      }
    };

    checkSocketIO();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state
  if (!isSocketReady && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading chat service...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Socket.IO is ready, render children
  return <>{children}</>;
}
