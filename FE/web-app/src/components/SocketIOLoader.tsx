"use client";

import { useEffect } from "react";

/**
 * SocketIOLoader - Dynamically loads Socket.IO from CDN
 * This runs client-side only to avoid SSR issues
 */
export default function SocketIOLoader() {
  useEffect(() => {
    // Check if socket.io is already loaded
    if (typeof window !== "undefined" && window.io) {
      console.log("✅ Socket.IO already loaded");
      window.__SOCKET_IO_LOADED__ = true;
      return;
    }

    // Create and inject the script tag
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.8.1/socket.io.min.js";
    script.integrity =
      "sha384-mkQ3/7FUtcGyoppY6bz/PORYoGqOl7/aSUMn2ymDOJcapfS6PHqxhRTMh1RR0Q6+";
    script.crossOrigin = "anonymous";
    script.async = false; // Load synchronously to ensure it's ready before app code runs

    script.onload = () => {
      console.log("✅ Socket.IO CDN loaded successfully");
      if (typeof window !== "undefined") {
        window.__SOCKET_IO_LOADED__ = true;
      }
    };

    script.onerror = (error) => {
      console.error("❌ Failed to load Socket.IO CDN:", error);
    };

    // Append to head for highest priority
    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
