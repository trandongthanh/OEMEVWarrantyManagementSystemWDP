"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  X,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import inventoryService from "@/services/inventoryService";
import { warehouseService, Warehouse } from "@/services/warehouseService";
import { toast } from "sonner";

interface InventoryBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  warehouseId?: string; // Optional now - if not provided, show warehouse selector
  userRole?: string; // To determine warehouse filtering logic
}

export default function InventoryBulkUpload({
  isOpen,
  onClose,
  onSuccess,
  warehouseId: providedWarehouseId,
  userRole,
}: InventoryBulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  // Always use IN adjustment type - OUT is removed
  const adjustmentType = "IN";
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    successCount: number;
    totalComponents: number;
    errors?: string[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Warehouse selection (for company coordinators)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine the actual warehouse ID to use
  const warehouseId = providedWarehouseId || selectedWarehouseId;

  // Function to load and filter warehouses
  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehouseService.getWarehouses();
      let filteredWarehouses = response.warehouses || [];

      // Filter warehouses based on user role
      // Company users: only show central warehouses (kho trung tam - serviceCenterId === null)
      // Parts coordinator: their warehouse is provided via warehouseId prop, no filtering needed here
      if (userRole && userRole.includes("company")) {
        filteredWarehouses = filteredWarehouses.filter(
          (warehouse) => warehouse.serviceCenterId === null
        );
      }

      setWarehouses(filteredWarehouses);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      toast.error("Failed to load warehouses");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Load warehouses if no warehouseId is provided (company coordinator case)
  // Reset data + load warehouses (nếu cần) mỗi khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setSelectedFile(null);
    setUploadResult(null);
    setUploadSuccess(false);
    setReason("");
    setNote("");
    setSelectedWarehouseId("");

    // Reset input file trong DOM
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Chỉ load warehouses nếu user không có providedWarehouseId
    if (!providedWarehouseId) {
      loadWarehouses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, providedWarehouseId, userRole]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Please select an Excel file (.xlsx or .xls)");
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Please drop an Excel file (.xlsx or .xls)");
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
      const blob = await inventoryService.downloadBulkAdjustmentTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inventory-adjustment-template.xlsx";
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

    if (!warehouseId) {
      toast.error("Please select a warehouse");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the adjustment");
      return;
    }

    try {
      setUploading(true);

      const result = await inventoryService.bulkCreateAdjustments({
        file: selectedFile,
        warehouseId,
        adjustmentType: adjustmentType,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });

      // Backend returns array of adjustment objects
      const adjustments = Array.isArray(result.data) ? result.data : [];
      const successCount = adjustments.length;
      const totalComponents = adjustments.reduce(
        (sum, adj) => sum + (adj.quantity || 0),
        0
      );

      setUploadResult({
        successCount,
        totalComponents,
        errors: [],
      });

      if (successCount > 0) {
        // Show success animation
        setUploadSuccess(true);

        // Show success toast for IN adjustments only
        toast.success(`Successfully imported ${totalComponents} component(s)`, {
          description: `${successCount} adjustment record(s) created. Components added to inventory.`,
          duration: 5000,
        });

        // Wait 3 seconds to show success state, THEN refresh parent and close
        setTimeout(() => {
          // Trigger onSuccess callback to refresh parent list right before closing
          onSuccess?.();

          // Close immediately after triggering refresh
          handleClose();
        }, 3000);
      } else {
        toast.error("No adjustments were created. Please check the file.");
      }
    } catch (error: unknown) {
      console.error("Error uploading adjustments:", error);
      const err = error as { response?: { data?: { message?: string } } };

      // Show detailed error message
      const errorMessage =
        err.response?.data?.message || "Failed to upload adjustments";
      toast.error(errorMessage, {
        duration: 5000,
      });

      // Set error state in upload result
      setUploadResult({
        successCount: 0,
        totalComponents: 0,
        errors: [errorMessage],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadResult(null);
      setUploadSuccess(false);
      setReason("");
      setNote("");
      setSelectedWarehouseId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Bulk Stock Import
                </h2>
                <p className="text-sm text-gray-500">
                  Upload Excel file to add inventory in bulk
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
                    Fill in component data (SKU and Serial Number for each
                    component)
                  </li>
                  <li>Provide a reason for this stock adjustment</li>
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

            {/* Warehouse Selector (only for company coordinators) */}
            {!providedWarehouseId && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <WarehouseIcon className="w-4 h-4 text-gray-500" />
                    Select Warehouse
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                {loadingWarehouses ? (
                  <div className="flex items-center justify-center py-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading warehouses...
                  </div>
                ) : (
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-2.5 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Choose a warehouse...</option>
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse.warehouseId}
                        value={warehouse.warehouseId}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                )}
                {!loadingWarehouses && warehouses.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No warehouses available. Please contact your administrator.
                  </p>
                )}
              </div>
            )}

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Adjustment <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., New supplier shipment, Customer return"
                disabled={uploading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 text-black"
              />
            </div>

            {/* Note Input (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional information about this import..."
                disabled={uploading}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 resize-none text-black"
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Upload Excel File
              </label>

              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-colors
                  ${
                    selectedFile
                      ? "border-blue-300 bg-blue-50"
                      : isDragging
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }
                  ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
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
                      Supports .xlsx, .xls (max 10MB)
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
                {/* Success Animation */}
                {uploadSuccess && uploadResult.successCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl font-semibold text-gray-900 mb-2"
                    >
                      {adjustmentType === "IN" ? "Import" : "Removal"}{" "}
                      Successful!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-gray-600 mb-4"
                    >
                      {uploadResult.successCount} SKU(s){" "}
                      {adjustmentType === "IN" ? "imported" : "removed"} (
                      {uploadResult.totalComponents} components)
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={handleClose}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Done
                    </motion.button>
                  </motion.div>
                )}

                {/* Stats - Show only if there are errors or not in success animation */}
                {(!uploadSuccess ||
                  (uploadResult.errors && uploadResult.errors.length > 0)) && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total SKUs</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {uploadResult?.successCount ?? 0}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">
                          Components
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {uploadResult?.totalComponents ?? 0}
                        </p>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600 mb-1">Errors</p>
                        <p className="text-2xl font-bold text-red-600">
                          {uploadResult?.errors?.length ?? 0}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    <p className="text-sm font-medium text-gray-700">Errors:</p>
                    {uploadResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                          <p>{err}</p>
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
                disabled={!selectedFile || uploading || !reason.trim()}
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
                    Upload Stock
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
