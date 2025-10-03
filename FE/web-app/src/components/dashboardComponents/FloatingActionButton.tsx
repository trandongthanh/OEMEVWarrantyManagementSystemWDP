"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Car, Wrench, AlertCircle, X } from "lucide-react";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: FileText,
      label: "New Claim",
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => console.log("New claim"),
    },
    {
      icon: Car,
      label: "Add Vehicle",
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => console.log("Add vehicle"),
    },
    {
      icon: Wrench,
      label: "Schedule Repair",
      color: "bg-amber-500 hover:bg-amber-600",
      action: () => console.log("Schedule repair"),
    },
    {
      icon: AlertCircle,
      label: "Report Issue",
      color: "bg-red-500 hover:bg-red-600",
      action: () => console.log("Report issue"),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-full text-white shadow-lg
                    ${action.color}
                    hover:shadow-xl hover:scale-105
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-white/20
                    backdrop-blur-sm
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg text-white
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-white/20
          ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 rotate-45"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          }
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 mx-auto" />
        ) : (
          <Plus className="w-6 h-6 mx-auto" />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
