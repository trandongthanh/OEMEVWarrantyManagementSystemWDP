"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  Download,
  Eye,
  Paperclip,
} from "lucide-react";
import type { ClaimData } from "./types";

interface InitialDocumentationStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: "image" | "video" | "document";
}

export function InitialDocumentationStep({
  data,
  onDataChange,
}: InitialDocumentationStepProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [notes, setNotes] = useState(data.notes || "");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FilePreview[] = [];

    Array.from(fileList).forEach((file) => {
      // File type validation
      const validTypes = [
        "image/",
        "video/",
        "application/pdf",
        "text/",
        "application/msword",
        "application/vnd.openxmlformats",
      ];
      const isValid = validTypes.some((type) => file.type.startsWith(type));

      if (!isValid) {
        alert(`File type ${file.type} is not supported`);
        return;
      }

      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const filePreview: FilePreview = {
        file,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document",
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreview.preview = e.target?.result as string;
          setFiles((prev) => [...prev, filePreview]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(filePreview);
      }
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }

    // Update parent component
    const allFiles = [
      ...files.map((f) => f.file),
      ...newFiles.map((f) => f.file),
    ];
    onDataChange({ documentation: allFiles });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onDataChange({ documentation: newFiles.map((f) => f.file) });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onDataChange({ notes: value });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-12 h-12 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <Paperclip className="w-6 h-6 text-gray-800" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-white tracking-wide">
            Initial Documentation
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Add initial notes and files to the warranty claim
          </p>
        </div>
      </div>

      {/* File Upload Area */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <h4 className="text-base font-semibold text-white mb-3">
            Upload Files
          </h4>
          <p className="text-xs text-gray-400 mb-3">
            Upload photos, videos, or documents related to the issue. Supported
            formats: JPG, PNG, PDF, DOC, TXT (Max 10MB each)
          </p>

          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${
                dragActive
                  ? "border-[#7c3aed] bg-[#7c3aed]/10"
                  : "border-[#27272a] hover:border-[#7c3aed]/50"
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {dragActive ? "Drop files here" : "Drag and drop files here"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or{" "}
                  <Button
                    size="sm"
                    variant="light"
                    className="text-[#7c3aed] hover:text-[#a855f7] p-0 h-auto"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    browse files
                  </Button>
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h5 className="text-sm font-medium text-white">
                Uploaded Files ({files.length})
              </h5>
              {files.map((filePreview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#27272a] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {filePreview.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreview.preview}
                        alt={filePreview.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#27272a] rounded flex items-center justify-center">
                        {getFileIcon(filePreview.file.type)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {filePreview.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatFileSize(filePreview.file.size)}
                        </span>
                        <Chip
                          size="sm"
                          variant="flat"
                          className="text-xs bg-[#27272a]"
                        >
                          {filePreview.type}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {filePreview.preview && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-gray-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-red-400 hover:text-red-300"
                      onPress={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Initial Notes */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Initial Notes
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Add any additional notes about the vehicle condition when received,
            customer communications, etc.
          </p>

          <div className="space-y-4">
            <textarea
              placeholder="Enter initial notes about the vehicle condition when received, customer communications, or any other relevant information..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={6}
              className="w-full p-4 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-white placeholder-gray-500 focus:border-[#7c3aed] focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">
                These notes will be visible to all assigned technicians
              </span>
              <span className="text-gray-500">
                {notes.length}/1000 characters
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documentation Guidelines */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardBody className="p-4">
          <h5 className="text-sm font-medium text-blue-300 mb-3">
            Documentation Best Practices
          </h5>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-200">
            <div>
              <h6 className="font-medium mb-2">Recommended Files:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• Photos of damaged/affected areas</li>
                <li>• Error message screenshots</li>
                <li>• Diagnostic reports</li>
                <li>• Customer communication records</li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium mb-2">File Requirements:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• Clear, well-lit photos</li>
                <li>• Multiple angles if applicable</li>
                <li>• Readable text in documents</li>
                <li>• Relevant filenames</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      {(files.length > 0 || notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-green-500/5 border-green-500/20">
            <CardBody className="p-4">
              <h5 className="text-sm font-medium text-green-300 mb-3">
                Documentation Summary
              </h5>
              <div className="space-y-2 text-sm">
                {files.length > 0 && (
                  <div>
                    <span className="text-gray-400">Files attached:</span>
                    <span className="text-white ml-2">
                      {files.length} files
                    </span>
                    <div className="text-xs text-gray-500 ml-2">
                      Total size:{" "}
                      {formatFileSize(
                        files.reduce((total, f) => total + f.file.size, 0)
                      )}
                    </div>
                  </div>
                )}
                {notes && (
                  <div>
                    <span className="text-gray-400">Initial notes:</span>
                    <span className="text-white ml-2">
                      Added ({notes.length} characters)
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
