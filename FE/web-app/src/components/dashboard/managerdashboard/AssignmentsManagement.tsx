"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Car,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  processingRecordService,
  ProcessingRecord,
  userService,
  Technician,
} from "@/services";
import { LucideIcon } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
> = {
  CHECKED_IN: {
    label: "Checked In",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CheckCircle,
  },
  IN_DIAGNOSIS: {
    label: "In Diagnosis",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Clock,
  },
  WAITING_FOR_PARTS: {
    label: "Waiting for Parts",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertCircle,
  },
  IN_REPAIR: {
    label: "In Repair",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: AlertCircle,
  },
};

interface AssignmentsManagementProps {
  selectedRecordId?: string; // For deep linking
}

export function AssignmentsManagement({
  selectedRecordId,
}: AssignmentsManagementProps) {
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(
    new Set(selectedRecordId ? [selectedRecordId] : [])
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsResponse, techsData] = await Promise.all([
        processingRecordService.getAllRecords({
          ...(statusFilter !== "ALL" && { status: statusFilter }),
        }),
        userService.getTechnicians(),
      ]);

      const recordsData =
        recordsResponse.data?.records?.records ||
        recordsResponse.data?.records ||
        [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setTechnicians(techsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRecords([]);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignMainTech = async (recordVin: string, techId: string) => {
    try {
      await processingRecordService.assignTechnician(recordVin, techId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error assigning main technician:", error);
      alert("Failed to assign main technician");
    }
  };

  const handleAssignLeadTech = async (
    guaranteeCaseId: string,
    techId: string
  ) => {
    try {
      // TODO: Implement backend endpoint
      console.log("Assign lead tech:", guaranteeCaseId, techId);
      alert(
        "Lead technician assignment not yet implemented in backend. See BACKEND_ANALYSIS.md"
      );
      // await guaranteeCaseService.assignLeadTech(guaranteeCaseId, techId);
      // await fetchData();
    } catch (error) {
      console.error("Error assigning lead technician:", error);
    }
  };

  const handleCreateTask = async (
    guaranteeCaseId: string,
    taskType: "DIAGNOSIS" | "REPAIR"
  ) => {
    try {
      // TODO: Implement backend endpoint
      console.log("Create task:", guaranteeCaseId, taskType);
      alert(
        `Task creation not yet implemented in backend. See BACKEND_ANALYSIS.md\nWould create ${taskType} task for case ${guaranteeCaseId}`
      );
      // await taskAssignmentService.create({
      //   guaranteeCaseId,
      //   taskType,
      //   technicianId: null // Will be assigned later
      // });
      // await fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleRecordExpanded = (recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const matchesSearch =
          searchQuery === "" ||
          record.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.vehicle?.licensePlate
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-2" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Assignment Management
          </h1>
          <p className="text-gray-600">
            Assign technicians to processing records, cases, and tasks
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VIN or license plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_DIAGNOSIS">In Diagnosis</option>
              <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
              <option value="IN_REPAIR">In Repair</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No processing records found</p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const isExpanded = expandedRecords.has(record.vin);
                const statusInfo =
                  statusConfig[record.status] || statusConfig.CHECKED_IN;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={record.vin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Record Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleRecordExpanded(record.vin)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Car className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">
                              {record.vin}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Model:{" "}
                              {typeof record.vehicle?.model === "string"
                                ? record.vehicle.model
                                : record.vehicle?.model?.name || "N/A"}
                            </span>
                            <span>•</span>
                            <span>
                              {record.guaranteeCases?.length || 0} Case(s)
                            </span>
                          </div>
                        </div>

                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 bg-gray-50"
                        >
                          <div className="p-6 space-y-6">
                            {/* Main Technician Assignment */}
                            <div className="bg-white p-4 rounded-xl">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Technician (Coordinator)
                              </label>
                              <div className="flex items-center text-black gap-3">
                                <select
                                  value={record.mainTechnician?.userId || ""}
                                  onChange={(e) =>
                                    handleAssignMainTech(
                                      record.vin,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                  <option value="">
                                    Select Main Technician
                                  </option>
                                  {technicians.map((tech) => (
                                    <option
                                      key={tech.userId}
                                      value={tech.userId}
                                    >
                                      {tech.name || tech.userId}
                                    </option>
                                  ))}
                                </select>
                                {record.mainTechnician && (
                                  <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Assigned
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Guarantee Cases */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Guarantee Cases
                              </h4>
                              <div className="space-y-4">
                                {record.guaranteeCases?.map((gCase) => (
                                  <div
                                    key={gCase.guaranteeCaseId}
                                    className="bg-white p-4 rounded-xl border border-gray-200"
                                  >
                                    {/* Case Header */}
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900 mb-1">
                                          {gCase.contentGuarantee}
                                        </h5>
                                        <span className="text-xs text-gray-500">
                                          Status:{" "}
                                          {gCase.status?.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Lead Technician Assignment */}
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lead Technician (Case Owner)
                                      </label>
                                      <select
                                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        onChange={(e) =>
                                          handleAssignLeadTech(
                                            gCase.guaranteeCaseId!,
                                            e.target.value
                                          )
                                        }
                                        defaultValue=""
                                      >
                                        <option value="">
                                          Select Lead Technician
                                        </option>
                                        {technicians.map((tech) => (
                                          <option
                                            key={tech.userId}
                                            value={tech.userId}
                                          >
                                            {tech.name || tech.userId}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Task Assignments Section */}
                                    <div className="border-t border-gray-200 pt-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h6 className="text-sm font-medium text-gray-700">
                                          Tasks
                                        </h6>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              handleCreateTask(
                                                gCase.guaranteeCaseId!,
                                                "DIAGNOSIS"
                                              )
                                            }
                                            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Diagnosis
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleCreateTask(
                                                gCase.guaranteeCaseId!,
                                                "REPAIR"
                                              )
                                            }
                                            className="px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Repair
                                          </button>
                                        </div>
                                      </div>

                                      {/* Task List Placeholder */}
                                      <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-500">
                                        Task assignments will appear here once
                                        backend endpoints are implemented
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {(!record.guaranteeCases ||
                                  record.guaranteeCases.length === 0) && (
                                  <div className="bg-gray-50 p-6 rounded-xl text-center text-sm text-gray-500">
                                    No guarantee cases for this record
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
