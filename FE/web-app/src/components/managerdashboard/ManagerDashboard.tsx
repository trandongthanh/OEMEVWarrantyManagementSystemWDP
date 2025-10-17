"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  AlertCircle,
  Loader,
  UserCheck,
  Clock,
  Calendar,
} from "lucide-react";
import managerService, {
  type Technician,
  type ProcessingRecord,
} from "@/services/managerService";
import { AssignTechnicianModal } from "./AssignTechnicianModal";

export function ManagerDashboard() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [processingRecords, setProcessingRecords] = useState<
    ProcessingRecord[]
  >([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ProcessingRecord | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadTechnicians(), loadProcessingRecords()]);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadTechnicians = async () => {
    setIsLoadingTechnicians(true);
    setError("");
    try {
      const response = await managerService.getTechnicians();
      setTechnicians(response.data);
    } catch (err: unknown) {
      setError("Failed to load technicians");
      console.error(err);
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  const loadProcessingRecords = async () => {
    setIsLoadingRecords(true);
    setError("");
    try {
      const response = await managerService.getProcessingRecords(
        statusFilter || undefined
      );
      // Ensure we have an array
      const records = Array.isArray(response.records) ? response.records : [];
      setProcessingRecords(records);
    } catch (err: unknown) {
      setError("Failed to load processing records");
      console.error(err);
      setProcessingRecords([]); // Set empty array on error
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleAssignTechnician = (record: ProcessingRecord) => {
    setSelectedRecord(record);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedRecord(null);
    loadProcessingRecords();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      CHECKED_IN: "bg-blue-100 text-blue-700",
      IN_DIAGNOSIS: "bg-yellow-100 text-yellow-700",
      WAITING_FOR_PARTS: "bg-orange-100 text-orange-700",
      PAID: "bg-green-100 text-green-700",
      IN_REPAIR: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  const workloadColor = (count: number) => {
    if (count === 0) return "text-green-600";
    if (count <= 2) return "text-yellow-600";
    return "text-red-600";
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
            Assignment Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Efficiently manage technicians and assign warranty cases
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

        {/* Technicians Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Technicians
                </h2>
                <p className="text-sm text-gray-500">
                  Current team availability
                </p>
              </div>
            </div>
            <button
              onClick={loadTechnicians}
              disabled={isLoadingTechnicians}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingTechnicians ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {isLoadingTechnicians ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map((tech) => (
                <motion.div
                  key={tech.userId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {tech.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {tech.userId.slice(0, 8)}...
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tech.workSchedule[0]?.status === "WORKING"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tech.workSchedule[0]?.status || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <ClipboardList className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Active Tasks:</span>
                    <span
                      className={`font-semibold ${workloadColor(
                        tech.activeTaskCount
                      )}`}
                    >
                      {tech.activeTaskCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    {tech.workSchedule[0]?.workDate
                      ? new Date(
                          tech.workSchedule[0].workDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Processing Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Processing Records
                </h2>
                <p className="text-sm text-gray-500">
                  Assign technicians to warranty cases
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_DIAGNOSIS">In Diagnosis</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button
                onClick={loadProcessingRecords}
                disabled={isLoadingRecords}
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingRecords ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {isLoadingRecords ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
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

                        {record.mainTechnician ? (
                          <div className="flex items-center gap-2 text-sm">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Assigned to:</span>
                            <span className="font-medium text-gray-900">
                              {record.mainTechnician.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>No technician assigned</span>
                          </div>
                        )}

                        <div className="mt-3 text-sm">
                          <span className="text-gray-600">Cases:</span>
                          <div className="mt-1 space-y-1">
                            {record.guaranteeCases.map((gCase) => (
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

                      <button
                        onClick={() => handleAssignTechnician(record)}
                        className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        {record.mainTechnician ? "Reassign" : "Assign"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Assign Technician Modal */}
      {showAssignModal && selectedRecord && (
        <AssignTechnicianModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          technicians={technicians}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
