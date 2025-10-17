"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Loader2, CheckCircle, Trash2 } from "lucide-react";

interface Task {
  taskId: string;
  guaranteeCaseId: string;
  taskType: "DIAGNOSIS" | "REPAIR";
  guaranteeCase?: {
    guaranteeCaseId: string;
    contentGuarantee: string;
    vin: string;
  };
}

interface ComponentUsage {
  componentName: string;
  quantity: number;
  notes?: string;
}

interface ReportSubmissionProps {
  task?: Task | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReportSubmission({
  task,
  onClose,
  onSuccess,
}: ReportSubmissionProps) {
  const [findings, setFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [components, setComponents] = useState<ComponentUsage[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [newComponent, setNewComponent] = useState({
    componentName: "",
    quantity: 1,
    notes: "",
  });

  const handleAddComponent = () => {
    if (!newComponent.componentName || newComponent.quantity < 1) {
      alert("Please provide component name and valid quantity");
      return;
    }

    setComponents([...components, { ...newComponent }]);
    setNewComponent({ componentName: "", quantity: 1, notes: "" });
    setShowComponentForm(false);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (newImages.length !== files.length) {
      alert("Only image files are allowed");
    }

    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task) {
      alert("No task selected for report submission");
      return;
    }

    if (!findings.trim()) {
      alert("Please provide your findings");
      return;
    }

    if (task.taskType === "DIAGNOSIS" && !diagnosis.trim()) {
      alert("Please provide a diagnosis for this case");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement backend endpoint
      console.log("Submitting report:", {
        taskId: task.taskId,
        findings,
        diagnosis,
        recommendation,
        components,
        imageCount: images.length,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(
        "Report submission not yet implemented in backend. See BACKEND_ANALYSIS.md\n\nReport data:\n" +
          JSON.stringify(
            {
              taskId: task.taskId,
              findings: findings.substring(0, 50) + "...",
              componentsUsed: components.length,
              imagesAttached: images.length,
            },
            null,
            2
          )
      );

      // await reportService.create({
      //   taskId: task.taskId,
      //   guaranteeCaseId: task.guaranteeCaseId,
      //   findings,
      //   diagnosis,
      //   recommendation,
      //   components,
      //   images
      // });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {task ? "Submit Report" : "Report Modal Test"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {task
                ? `${
                    task.taskType === "DIAGNOSIS" ? "Diagnosis" : "Repair"
                  } Report for ${task.guaranteeCase?.vin}`
                : "Testing report modal functionality"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Case Information */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-2">
              {task ? "Case Details" : "Test Mode"}
            </h3>
            <p className="text-sm text-gray-600">
              {task
                ? task.guaranteeCase?.contentGuarantee || "No description"
                : "This is a test of the report modal functionality"}
            </p>
          </div>

          {/* Findings (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Findings <span className="text-red-600">*</span>
            </label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describe what you found during inspection..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none text-gray-900"
              required
            />
          </div>

          {/* Diagnosis (Required for DIAGNOSIS tasks) */}
          {task?.taskType === "DIAGNOSIS" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis <span className="text-red-600">*</span>
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Provide your diagnosis and root cause analysis..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none text-gray-900"
                required
              />
            </div>
          )}

          {/* Recommendation (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Provide recommendations for next steps or preventive measures..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none text-gray-900"
            />
          </div>

          {/* Component Usage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Components Used
              </label>
              <button
                type="button"
                onClick={() => setShowComponentForm(!showComponentForm)}
                className="px-3 py-1 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                {showComponentForm ? "Cancel" : "+ Add Component"}
              </button>
            </div>

            {/* Component Form */}
            {showComponentForm && (
              <div className="bg-gray-50 p-4 rounded-xl mb-3 space-y-3">
                <input
                  type="text"
                  placeholder="Component name"
                  value={newComponent.componentName}
                  onChange={(e) =>
                    setNewComponent({
                      ...newComponent,
                      componentName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={newComponent.quantity}
                    onChange={(e) =>
                      setNewComponent({
                        ...newComponent,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={newComponent.notes}
                    onChange={(e) =>
                      setNewComponent({
                        ...newComponent,
                        notes: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddComponent}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Component
                </button>
              </div>
            )}

            {/* Components List */}
            {components.length > 0 && (
              <div className="space-y-2">
                {components.map((comp, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {comp.componentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Quantity: {comp.quantity}
                        {comp.notes && ` • ${comp.notes}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(index)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {components.length === 0 && !showComponentForm && (
              <div className="text-center py-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                No components added yet
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Attach Images
            </label>

            {/* Upload Button */}
            <label className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-red-300 text-red-600 bg-white rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !findings.trim()}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
