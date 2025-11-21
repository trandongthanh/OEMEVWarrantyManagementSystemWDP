"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, AlertCircle } from "lucide-react";
import { useState } from "react";

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: "text" | "date" | "number" | "textarea";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export function PromptDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = "",
  defaultValue = "",
  confirmText = "Submit",
  cancelText = "Cancel",
  inputType = "text",
  required = false,
  minLength,
  maxLength,
  rows = 3,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");

  const validateInput = (val: string): boolean => {
    if (required && !val.trim()) {
      setError("This field is required");
      return false;
    }
    if (minLength && val.trim().length < minLength) {
      setError(`Minimum ${minLength} characters required`);
      return false;
    }
    if (maxLength && val.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return false;
    }
    setError("");
    return true;
  };

  const handleConfirm = () => {
    if (!validateInput(value)) {
      return;
    }
    onConfirm(value);
    onClose();
    setValue("");
    setError("");
  };

  const handleClose = () => {
    onClose();
    setValue("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && inputType !== "textarea") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-blue-500">
                    <MessageSquare size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Input */}
                <div className="mt-4">
                  {inputType === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        validateInput(e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      rows={rows}
                      maxLength={maxLength}
                      className={`w-full px-4 py-2.5 border text-black rounded-lg focus:ring-2 transition-all resize-none ${
                        error
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      autoFocus
                    />
                  ) : (
                    <input
                      type={inputType}
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        validateInput(e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      className={`w-full px-4 py-2.5 border text-black rounded-lg focus:ring-2 transition-all ${
                        error
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      autoFocus
                    />
                  )}

                  {/* Validation Error */}
                  {error && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Character Counter */}
                  {(maxLength || minLength) && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{minLength && `Min: ${minLength} characters`}</span>
                      <span>
                        {value.length}
                        {maxLength && `/${maxLength}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={required && !value.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
