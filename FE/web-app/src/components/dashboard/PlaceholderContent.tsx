"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PlaceholderContentProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PlaceholderContent({
  icon: Icon,
  title,
  description,
  action,
}: PlaceholderContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center p-8"
    >
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
