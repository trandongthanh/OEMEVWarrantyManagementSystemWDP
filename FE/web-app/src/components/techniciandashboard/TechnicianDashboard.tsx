"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Plus,
  Wrench,
  FileText,
} from "lucide-react";
import { processingRecordService } from "@/services";
import { CreateCaseLinesModal } from "./CreateCaseLinesModal";

interface ProcessingRecord {
  id?: string;
  vin: string;
  status: string;
  checkInDate: string;
  odometer: number;
  mainTechnician?: {
    userId: string;
    name: string;
  } | null;
  guaranteeCases?: Array<{
    guaranteeCaseId?: string;
    caseId?: string;
    contentGuarantee: string;
    status?: string;
    statusForGuaranteeCase?: string;
  }>;
}

export function TechnicianDashboard() {
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ProcessingRecord | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProcessingRecords();
  }, []);

  const loadProcessingRecords = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await processingRecordService.getAllRecords();
      // Filter records assigned to current technician
      const assignedRecords = response.data.records.filter(
        (record: ProcessingRecord) => record.mainTechnician
      );
      setProcessingRecords(assignedRecords);
    } catch (err: unknown) {
      setError("Failed to load processing records");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCaseLines = (record: ProcessingRecord) => {
    setSelectedRecord(record);
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSelectedRecord(null);
    loadProcessingRecords();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      CHECKED_IN: "bg-blue-100 text-blue-700",
      IN_DIAGNOSIS: "bg-yellow-100 text-yellow-700",
      WAITING_FOR_PARTS: "bg-orange-100 text-orange-700",
      IN_REPAIR: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Technician Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your assigned warranty cases and create case lines
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-lg"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Assigned Cases Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Assigned Cases
                </h2>
                <p className="text-sm text-gray-500">
                  Warranty cases assigned to you
                </p>
              </div>
            </div>
            <button
              onClick={loadProcessingRecords}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : processingRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assigned cases
              </h3>
              <p className="text-gray-500 text-center">
                You don&apos;t have any warranty cases assigned to you at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processingRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          VIN: {record.vin}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Check-in:{" "}
                          {new Date(record.checkInDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Odometer:</span>
                          {record.odometer.toLocaleString()} km
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">Cases:</span>
                        <div className="mt-1 space-y-1">
                          {record.guaranteeCases?.map((gCase) => (
                            <div
                              key={gCase.guaranteeCaseId}
                              className="text-gray-700 pl-4 border-l-2 border-gray-200"
                            >
                              {gCase.contentGuarantee}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleCreateCaseLines(record)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Case Lines
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Completed</h3>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">12</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">In Progress</h3>
                <p className="text-sm text-gray-500">Active cases</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {processingRecords.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Case Lines</h3>
                <p className="text-sm text-gray-500">Created this week</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">28</p>
          </motion.div>
        </div>
      </div>

      {/* Create Case Lines Modal */}
      {showCreateModal && selectedRecord && (
        <CreateCaseLinesModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedRecord(null);
          }}
          recordId={selectedRecord.id || ""}
          caseId={selectedRecord.guaranteeCases?.[0]?.guaranteeCaseId || ""}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}