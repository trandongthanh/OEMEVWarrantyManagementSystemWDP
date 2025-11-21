"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import ChatPanel from "./ChatPanel";

interface FloatingChatWidgetProps {
  customerName?: string;
  vin?: string;
  recordId?: string;
}

export default function FloatingChatWidget({
  customerName,
  vin,
  recordId,
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "64px" : "600px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200"
          >
            {isMinimized ? (
              <div
                onClick={maximizeChat}
                className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 px-6 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {customerName || "Customer Chat"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChat();
                  }}
                  className="p-2 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    Customer Support
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={minimizeChat}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Minimize2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={toggleChat}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatPanel
                    recordId={recordId}
                    customerName={customerName}
                    vin={vin}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
