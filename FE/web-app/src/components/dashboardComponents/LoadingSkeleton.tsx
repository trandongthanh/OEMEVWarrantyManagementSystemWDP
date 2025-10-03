"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "list" | "stat";
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "stat":
        return (
          <div
            className={`p-5 rounded-xl bg-gradient-to-br from-white/5 to-black/10 border border-white/10 ${className}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg skeleton"></div>
                <div className="w-24 h-4 bg-white/10 rounded skeleton"></div>
              </div>
              <div className="w-12 h-3 bg-white/10 rounded skeleton"></div>
            </div>
            <div className="w-16 h-8 bg-white/10 rounded skeleton mb-2"></div>
            <div className="w-full h-1 bg-white/10 rounded skeleton"></div>
          </div>
        );

      case "table":
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full skeleton"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-white/10 rounded skeleton"></div>
                  <div className="w-1/2 h-3 bg-white/10 rounded skeleton"></div>
                </div>
                <div className="w-20 h-6 bg-white/10 rounded-full skeleton"></div>
              </div>
            ))}
          </div>
        );

      case "list":
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="w-3 h-3 bg-white/10 rounded-full skeleton"></div>
                <div className="flex-1">
                  <div className="w-2/3 h-4 bg-white/10 rounded skeleton mb-1"></div>
                  <div className="w-1/3 h-3 bg-white/10 rounded skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default: // card
        return (
          <div
            className={`p-6 rounded-2xl bg-gradient-to-br from-white/5 to-black/10 border border-white/10 ${className}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-32 h-6 bg-white/10 rounded skeleton"></div>
                <div className="w-20 h-5 bg-white/10 rounded skeleton"></div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-white/10 rounded skeleton"></div>
                <div className="w-4/5 h-4 bg-white/10 rounded skeleton"></div>
                <div className="w-3/5 h-4 bg-white/10 rounded skeleton"></div>
              </div>
              <div className="flex space-x-2 pt-2">
                <div className="w-16 h-8 bg-white/10 rounded skeleton"></div>
                <div className="w-16 h-8 bg-white/10 rounded skeleton"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </motion.div>
  );
}
