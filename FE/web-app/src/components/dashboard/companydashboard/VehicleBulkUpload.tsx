"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  X,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import vehicleService from "@/services/vehicleService";
import { toast } from "sonner";

interface VehicleBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VehicleBulkUpload({
  isOpen,
  onClose,
  onSuccess,
}: VehicleBulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
    errors?: Array<{
      row: number;
      vin?: string;
      error: string;
    }>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".csv")
      ) {
        toast.error("Please select an Excel file (.xlsx, .xls, or .csv)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const blob = await vehicleService.downloadBulkCreateTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "vehicles_bulk_create_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      const result = await vehicleService.bulkCreateVehicles(selectedFile);

      setUploadResult(result.data);

      if (result.data.summary.failed === 0) {
        toast.success(
          `Successfully created ${result.data.summary.successful} vehicles!`
        );
        onSuccess?.();
      } else {
        toast.warning(
          `Created ${result.data.summary.successful} vehicles, ${result.data.summary.failed} failed`
        );
      }
    } catch (error: unknown) {
      console.error("Error uploading vehicles:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload vehicles");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Bulk Upload Vehicles
                </h2>
                <p className="text-sm text-gray-500">
                  Upload Excel file to create multiple vehicles
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 space-y-2">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Download the Excel template below</li>
                  <li>
                    Fill in vehicle data (VIN, Model SKU, Date of Manufacture,
                    Place of Manufacture)
                  </li>
                  <li>Upload the completed file</li>
                  <li>Review the results</li>
                </ol>
              </div>
            </div>

            {/* Download Template Button */}
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate || uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
            >
              {downloadingTemplate ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Downloading Template...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Template
                </>
              )}
            </button>

            {/* File Upload Area */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Upload Excel File
              </label>

              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-colors
                  ${
                    selectedFile
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }
                  ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setUploadResult(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors ml-auto"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to select Excel file or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports .xlsx, .xls, .csv (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {uploadResult.summary.total}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {uploadResult.summary.successful}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {uploadResult.summary.failed}
                    </p>
                  </div>
                </div>

                {/* Error Details */}
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    <p className="text-sm font-medium text-gray-700">Errors:</p>
                    {uploadResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                          <p className="font-medium">Row {error.row}</p>
                          {error.vin && (
                            <p className="text-red-600">VIN: {error.vin}</p>
                          )}
                          <p>{error.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploadResult ? "Close" : "Cancel"}
            </button>
            {!uploadResult && (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Vehicles
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export { VehicleBulkUpload };
