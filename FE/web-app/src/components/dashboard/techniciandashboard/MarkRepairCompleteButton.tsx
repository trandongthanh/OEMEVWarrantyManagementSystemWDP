"use client";

import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import caseLineService from "@/services/caseLineService";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface MarkRepairCompleteButtonProps {
  caseLineId: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
  showNextSteps?: boolean; // Show next action suggestions
  pendingRepairsCount?: number; // Number of other pending repairs
}

export function MarkRepairCompleteButton({
  caseLineId,
  onSuccess,
  disabled = false,
  className = "",
  showNextSteps = false,
  pendingRepairsCount = 0,
}: MarkRepairCompleteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = () => {
    setShowConfirmModal(true);
    setImageFiles([]);
    setImagePreviews([]);
    setError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError("Image size must be less than 5MB");
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmComplete = async () => {
    setError(null);

    if (imageFiles.length === 0) {
      setError("Please upload at least one installation image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Cloudinary first
      const imageUrls: string[] = [];

      for (const file of imageFiles) {
        const cloudinaryUrl = await uploadToCloudinary(file);
        imageUrls.push(cloudinaryUrl);
      }

      await caseLineService.markRepairComplete(caseLineId, imageUrls);

      setShowConfirmModal(false);

      if (showNextSteps && pendingRepairsCount > 0) {
        setShowSuccess(true);
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 3000);
      } else {
        onSuccess?.();
      }
    } catch (err: unknown) {
      console.error("Failed to mark repair as complete:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to mark repair as complete"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        disabled={disabled || isSubmitting}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <CheckCircle className="w-4 h-4" />
        {isSubmitting ? "Marking..." : "Mark Complete"}
      </button>

      {showSuccess && pendingRepairsCount > 0 && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              Repair marked complete!
            </p>
            <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
              {pendingRepairsCount} more repair
              {pendingRepairsCount !== 1 ? "s" : ""} pending
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Confirm Completion
                  </h2>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    This will mark the repair as complete. Make sure the
                    component has been installed and all repair work is
                    finished.
                  </p>
                </div>

                {/* Installation Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installation Images * (Max 5 images, 5MB each)
                  </label>
                  <div className="space-y-3">
                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-green-700"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Click to upload images
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Installation ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                              <ImageIcon className="w-3 h-3 inline mr-1" />
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {imageFiles.length} / 5 images uploaded
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {pendingRepairsCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      You have {pendingRepairsCount} more repair
                      {pendingRepairsCount !== 1 ? "s" : ""} waiting to be
                      completed.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
