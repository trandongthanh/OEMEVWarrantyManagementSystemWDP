"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import taskAssignmentService, {
  TaskAssignment,
} from "@/services/taskAssignmentService";
import {
  Loader2,
  ClipboardList,
  User,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar,
  Clock,
  Car,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WorkflowTimeline } from "@/components/shared/WorkflowTimeline";
import { useAuth } from "@/hooks/useAuth";

export default function TaskAssignmentList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskAssignment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  useEffect(() => {
    loadTasks(1);
  }, []);

  // Filter tasks on client-side for technicians
  useEffect(() => {
    if (!tasks.length) {
      setFilteredTasks([]);
      return;
    }

    // If user is a technician, filter to show only their tasks
    if (user?.roleName === "service_center_technician" && user?.userId) {
      const myTasks = tasks.filter(
        (task) => task.technician?.userId === user.userId
      );
      setFilteredTasks(myTasks);
    } else {
      // Managers and staff see all tasks
      setFilteredTasks(tasks);
    }
  }, [tasks, user]);

  const loadTasks = async (page: number) => {
    try {
      setLoading(true);

      const result = await taskAssignmentService.getTaskAssignments({
        page,
        limit: 20,
      });

      setTasks(result.tasks || []);
      if (result.pagination) {
        setPagination({
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (err) {
      console.error("Error fetching task assignments:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };

      // Handle backend schema mismatch gracefully
      if (errorObj.response?.data?.message?.includes("Unknown column")) {
        setError(
          "Database configuration issue detected. The backend needs to be updated to use 'vehicleModelId' instead of 'modelId' in the Vehicle table query."
        );
      } else {
        setError(
          errorObj.response?.data?.message || "Failed to load task assignments"
        );
      }

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get case lines for DIAGNOSIS tasks
  const getDiagnosisCaseLines = (task: TaskAssignment) => {
    if (task.taskType !== "DIAGNOSIS" || !task.vehicleProcessingRecord) {
      return [];
    }

    const guaranteeCases = (
      task.vehicleProcessingRecord as Record<string, unknown>
    )?.guaranteeCases;
    if (!guaranteeCases || !Array.isArray(guaranteeCases)) {
      return [];
    }

    // Get all case lines from all guarantee cases for this vehicle
    const allCaseLines = guaranteeCases.flatMap(
      (gc: Record<string, unknown>) =>
        (gc.caseLines as Record<string, unknown>[]) || []
    );

    // Filter to case lines created by this technician
    return allCaseLines.filter(
      (cl: Record<string, unknown>) => cl.diagnosticTechId === task.technicianId
    );
  };

  // Helper function to check if diagnosis task is completed
  const isDiagnosisCompleted = (task: TaskAssignment) => {
    if (task.taskType !== "DIAGNOSIS") return false;
    const caseLines = getDiagnosisCaseLines(task);
    return (
      caseLines.length > 0 &&
      caseLines.some((cl: Record<string, unknown>) => cl.diagnosisText)
    );
  };

  const getTimelineEvents = (task: TaskAssignment) => {
    const events: Array<{
      status: string;
      timestamp: string | null;
      label: string;
      user: { userId: string; name: string } | null;
      description: string;
    }> = [
      {
        status: "ASSIGNED",
        timestamp: task.assignedAt || null,
        label: "Task Assigned",
        user: task.technician
          ? { userId: task.technician.userId, name: task.technician.name }
          : null,
        description: `${
          task.taskType === "DIAGNOSIS" ? "Diagnosis" : "Repair"
        } task assigned to technician`,
      },
    ];

    // Add vehicle check-in event if processing record exists
    if (task.vehicleProcessingRecord) {
      events.push({
        status: "CHECKED_IN",
        timestamp: task.assignedAt as string, // Use assignment time as check-in proxy
        label: "Vehicle Check-In",
        user: null,
        description: `VIN: ${task.vehicleProcessingRecord.vin}`,
      });
    }

    // Add case line events if available
    if (task.caseLine) {
      if (task.caseLine.diagnosisText) {
        events.push({
          status: "DIAGNOSED",
          timestamp: task.caseLine.diagnosisText
            ? (task.createdAt as string)
            : null,
          label: "Diagnosis Complete",
          user: task.technician
            ? { userId: task.technician.userId, name: task.technician.name }
            : null,
          description: task.caseLine.diagnosisText?.substring(0, 50) + "...",
        });
      }
    } else if (task.taskType === "DIAGNOSIS") {
      // For DIAGNOSIS tasks, check case lines from vehicle processing record
      const diagnosisCaseLines = getDiagnosisCaseLines(task);
      if (diagnosisCaseLines.length > 0) {
        const firstCaseLine = diagnosisCaseLines[0];
        if (firstCaseLine.diagnosisText) {
          events.push({
            status: "DIAGNOSED",
            timestamp: task.updatedAt as string,
            label: "Diagnosis Complete",
            user: task.technician
              ? { userId: task.technician.userId, name: task.technician.name }
              : null,
            description: `${diagnosisCaseLines.length} issue(s) diagnosed`,
          });

          // Check if any case line has been approved
          const hasApproved = diagnosisCaseLines.some(
            (cl: Record<string, unknown>) =>
              cl.status === "CUSTOMER_APPROVED" ||
              cl.status === "WAITING_FOR_PARTS" ||
              cl.status === "PARTS_AVAILABLE" ||
              cl.status === "READY_FOR_REPAIR" ||
              cl.status === "IN_REPAIR" ||
              cl.status === "COMPLETED"
          );

          if (hasApproved) {
            // Get the most recent approval timestamp
            const approvedCaseLine = diagnosisCaseLines.find(
              (cl: Record<string, unknown>) =>
                cl.status === "CUSTOMER_APPROVED" ||
                cl.status === "WAITING_FOR_PARTS" ||
                cl.status === "PARTS_AVAILABLE" ||
                cl.status === "READY_FOR_REPAIR" ||
                cl.status === "IN_REPAIR" ||
                cl.status === "COMPLETED"
            );

            events.push({
              status: "APPROVED",
              timestamp:
                (approvedCaseLine?.updatedAt as string) ||
                (task.updatedAt as string),
              label: "Customer Approved",
              user: null,
              description: "Customer approved the diagnosis and repair plan",
            });
          }
        }
      }
    }

    // Add approval and repair events
    if (task.caseLine) {
      if (
        task.caseLine.status === "CUSTOMER_APPROVED" ||
        task.caseLine.status === "WAITING_FOR_PARTS" ||
        task.caseLine.status === "PARTS_AVAILABLE" ||
        task.caseLine.status === "READY_FOR_REPAIR" ||
        task.caseLine.status === "IN_REPAIR" ||
        task.caseLine.status === "COMPLETED"
      ) {
        events.push({
          status: "APPROVED",
          timestamp: (task.caseLine as Record<string, unknown>).updatedAt
            ? ((task.caseLine as Record<string, unknown>).updatedAt as string)
            : (task.updatedAt as string),
          label: "Customer Approved",
          user: null,
          description: "Customer approved the repair work",
        });
      }

      if (task.caseLine.correctionText) {
        events.push({
          status: "REPAIRED",
          timestamp:
            task.caseLine.status === "COMPLETED"
              ? ((task.caseLine as Record<string, unknown>).updatedAt as string)
              : null,
          label: "Repair Complete",
          user: task.technician
            ? { userId: task.technician.userId, name: task.technician.name }
            : null,
          description: task.caseLine.correctionText?.substring(0, 50) + "...",
        });
      }
    }

    // Add completion event
    const completionTimestamp =
      task.completedAt ||
      (task.caseLine?.status === "COMPLETED"
        ? ((task.caseLine as Record<string, unknown>).updatedAt as string)
        : null) ||
      (task.vehicleProcessingRecord?.status === "COMPLETED" ||
      task.vehicleProcessingRecord?.status === "READY_FOR_PICKUP"
        ? (task.updatedAt as string)
        : null);

    events.push({
      status: "COMPLETED",
      timestamp: completionTimestamp,
      label: "Task Completed",
      user:
        completionTimestamp && task.technician
          ? { userId: task.technician.userId, name: task.technician.name }
          : null,
      description: completionTimestamp
        ? "Task successfully completed"
        : "Awaiting completion",
    });

    // Add vehicle ready for pickup if applicable
    if (
      task.vehicleProcessingRecord?.status === "READY_FOR_PICKUP" ||
      task.vehicleProcessingRecord?.status === "COMPLETED"
    ) {
      events.push({
        status: "READY_FOR_PICKUP",
        timestamp:
          task.vehicleProcessingRecord.status === "READY_FOR_PICKUP" ||
          task.vehicleProcessingRecord.status === "COMPLETED"
            ? (task.updatedAt as string)
            : null,
        label: "Ready for Pickup",
        user: null,
        description: "Vehicle repair completed and ready for customer pickup",
      });
    }

    return events;
  };

  const getTaskStatus = (task: TaskAssignment): string => {
    if (task.completedAt) return "COMPLETED";

    // For DIAGNOSIS tasks without direct case line, check vehicle processing record
    if (task.taskType === "DIAGNOSIS" && !task.caseLine) {
      const diagnosisCompleted = isDiagnosisCompleted(task);
      if (diagnosisCompleted) {
        return "WAITING"; // Diagnosis done, waiting for approval
      }
      // Check if vehicle processing record is completed
      if (task.vehicleProcessingRecord?.status === "COMPLETED") {
        return "COMPLETED";
      }
    }

    // Check case line status first (most accurate)
    if (task.caseLine) {
      const status = task.caseLine.status;

      // COMPLETED status takes priority
      if (status === "COMPLETED") return "COMPLETED";

      // For DIAGNOSIS tasks
      if (task.taskType === "DIAGNOSIS") {
        if (
          task.caseLine.diagnosisText &&
          (status === "PENDING_APPROVAL" || status === "CUSTOMER_APPROVED")
        ) {
          return "WAITING"; // Diagnosis done, waiting for approval/next step
        }
      }

      // For REPAIR tasks
      if (task.taskType === "REPAIR") {
        if (status === "WAITING_FOR_PARTS") return "BLOCKED";
        if (status === "PARTS_AVAILABLE" || status === "READY_FOR_REPAIR")
          return "READY";
        if (status === "IN_REPAIR") return "IN_PROGRESS";
      }
    }

    // Fallback to task assignment status
    if (task.isActive) return "IN_PROGRESS";

    return "PENDING";
  };

  const getFilteredTasks = () => {
    // First filter by technician (if applicable), then by status filter
    const baseTasks = filteredTasks;
    if (!statusFilter) return baseTasks;
    return baseTasks.filter((task) => getTaskStatus(task) === statusFilter);
  };

  const getStatusBadge = (task: TaskAssignment) => {
    let status:
      | "PENDING"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "WAITING"
      | "BLOCKED"
      | "READY" = "PENDING";
    let label = "Not Started";

    if (task.completedAt) {
      status = "COMPLETED";
      label = "Completed";
    } else if (task.caseLine?.status === "COMPLETED") {
      // Case line completed
      status = "COMPLETED";
      label = "Completed";
    } else if (task.taskType === "DIAGNOSIS") {
      // Check if diagnosis was completed via vehicle processing record
      const diagnosisCompleted = isDiagnosisCompleted(task);
      if (diagnosisCompleted) {
        status = "WAITING";
        label = "Awaiting Approval";
      } else if (
        task.vehicleProcessingRecord?.status === "COMPLETED" ||
        task.vehicleProcessingRecord?.status === "READY_FOR_PICKUP"
      ) {
        status = "COMPLETED";
        label = "Completed";
      } else if (task.caseLine?.diagnosisText) {
        status = "WAITING";
        label = "Awaiting Approval";
      } else if (task.isActive) {
        status = "IN_PROGRESS";
        label = "In Progress";
      }
    } else if (task.taskType === "REPAIR" && task.caseLine) {
      // Repair tasks
      const caseLineStatus = task.caseLine.status;
      if (caseLineStatus === "WAITING_FOR_PARTS") {
        status = "BLOCKED";
        label = "Waiting for Parts";
      } else if (
        caseLineStatus === "PARTS_AVAILABLE" ||
        caseLineStatus === "READY_FOR_REPAIR"
      ) {
        status = "READY";
        label = "Ready to Start";
      } else if (caseLineStatus === "IN_REPAIR") {
        status = "IN_PROGRESS";
        label = "In Repair";
      }
    } else if (task.isActive) {
      status = "IN_PROGRESS";
      label = "In Progress";
    }

    const styles: Record<
      "PENDING" | "IN_PROGRESS" | "COMPLETED" | "WAITING" | "BLOCKED" | "READY",
      { bg: string; text: string; icon: typeof Clock }
    > = {
      PENDING: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock },
      WAITING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      BLOCKED: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: AlertCircle,
      },
      READY: { bg: "bg-teal-100", text: "text-teal-700", icon: CheckCircle2 },
      IN_PROGRESS: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle2,
      },
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {label}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Task Assignments
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor technician task assignments and track progress
          </p>
        </div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="w-5 h-5" />
              <span className="font-semibold text-gray-900">Filters</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                className="border border-gray-300 text-black rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="PENDING">Not Started</option>
                <option value="WAITING">Awaiting Approval</option>
                <option value="BLOCKED">Waiting for Parts</option>
                <option value="READY">Ready to Start</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tasks List Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Loading Tasks
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    loadTasks(1);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : getFilteredTasks().length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No task assignments found</p>
              <p className="text-sm mt-1">
                {statusFilter
                  ? `No tasks with status "${statusFilter}"`
                  : "No active task assignments"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {getFilteredTasks().map((task, index, array) => (
                  <motion.div
                    key={task.id || `task-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-6">
                      {/* Timeline Column */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            task.taskType === "DIAGNOSIS"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {task.taskType === "DIAGNOSIS" ? (
                            <ClipboardList className="w-6 h-6" />
                          ) : (
                            <Wrench className="w-6 h-6" />
                          )}
                        </div>
                        {index < array.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                        )}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1">
                        {/* Header: Task Type, Status, VIN */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.taskType?.replace(/_/g, " ") || "Task"}
                              </h3>
                              {getStatusBadge(task)}
                            </div>
                            {task.vehicleProcessingRecord?.vehicle?.vin && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Car className="w-4 h-4" />
                                <span className="font-mono font-medium">
                                  {task.vehicleProcessingRecord.vehicle.vin}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setExpandedTaskId(
                                expandedTaskId === task.id ? null : task.id
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            {expandedTaskId === task.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View Timeline
                              </>
                            )}
                          </button>
                        </div>

                        {/* Timeline Information */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          {/* Technician */}
                          {task.technician && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Assigned Technician
                              </p>
                              <p className="font-medium text-gray-900">
                                {task.technician.name}
                              </p>
                              {task.technician.phone && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {task.technician.phone}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Assigned Date */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Assigned At
                            </p>
                            <p className="text-sm text-gray-900">
                              {new Date(task.assignedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(task.assignedAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          {/* Duration or Completion */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {task.completedAt ? "Completed At" : "Duration"}
                            </p>
                            {task.completedAt ? (
                              <>
                                <p className="text-sm text-gray-900">
                                  {new Date(
                                    task.completedAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(
                                    task.completedAt
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-900">
                                {Math.floor(
                                  (Date.now() -
                                    new Date(task.assignedAt).getTime()) /
                                    (1000 * 60 * 60)
                                )}
                                h{" "}
                                {Math.floor(
                                  ((Date.now() -
                                    new Date(task.assignedAt).getTime()) %
                                    (1000 * 60 * 60)) /
                                    (1000 * 60)
                                )}
                                m
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Workflow Timeline - Expandable */}
                        {expandedTaskId === task.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-200 shadow-sm"
                          >
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Workflow Timeline
                            </h4>
                            <div className="overflow-x-auto">
                              <WorkflowTimeline
                                events={getTimelineEvents(task)}
                                currentStatus={
                                  task.vehicleProcessingRecord?.status ===
                                    "READY_FOR_PICKUP" ||
                                  task.vehicleProcessingRecord?.status ===
                                    "COMPLETED"
                                    ? "READY_FOR_PICKUP"
                                    : task.completedAt
                                    ? "COMPLETED"
                                    : task.caseLine?.status === "COMPLETED"
                                    ? "COMPLETED"
                                    : isDiagnosisCompleted(task)
                                    ? "APPROVED"
                                    : task.caseLine?.diagnosisText
                                    ? "DIAGNOSED"
                                    : task.isActive
                                    ? "ASSIGNED"
                                    : "PENDING"
                                }
                                variant="horizontal"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Processing Record Status */}
                        {task.vehicleProcessingRecord && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-blue-700 mb-1">
                                  Vehicle Status
                                </p>
                                <p className="text-sm font-semibold text-blue-900">
                                  {task.vehicleProcessingRecord.status?.replace(
                                    /_/g,
                                    " "
                                  )}
                                </p>
                              </div>
                              {task.vehicleProcessingRecord
                                .createdByStaffId && (
                                <p className="text-xs text-blue-600">
                                  ID:{" "}
                                  {task.vehicleProcessingRecord.vehicleProcessingRecordId?.substring(
                                    0,
                                    8
                                  )}
                                  ...
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Case Line Status - Important for Managers */}
                        {task.caseLine && task.caseLine.status && (
                          <div
                            className={`mb-4 p-3 rounded-lg border ${
                              task.caseLine.status === "WAITING_FOR_PARTS"
                                ? "bg-orange-50 border-orange-200"
                                : task.caseLine.status === "PARTS_AVAILABLE"
                                ? "bg-green-50 border-green-200"
                                : task.caseLine.status === "READY_FOR_REPAIR"
                                ? "bg-purple-50 border-purple-200"
                                : task.caseLine.status === "IN_REPAIR"
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  task.caseLine.status === "WAITING_FOR_PARTS"
                                    ? "bg-orange-500 animate-pulse"
                                    : task.caseLine.status === "PARTS_AVAILABLE"
                                    ? "bg-green-500"
                                    : task.caseLine.status ===
                                      "READY_FOR_REPAIR"
                                    ? "bg-purple-500"
                                    : task.caseLine.status === "IN_REPAIR"
                                    ? "bg-blue-500 animate-pulse"
                                    : "bg-gray-500"
                                }`}
                              />
                              <p
                                className={`text-xs font-medium mb-1 ${
                                  task.caseLine.status === "WAITING_FOR_PARTS"
                                    ? "text-orange-700"
                                    : task.caseLine.status === "PARTS_AVAILABLE"
                                    ? "text-green-700"
                                    : task.caseLine.status ===
                                      "READY_FOR_REPAIR"
                                    ? "text-purple-700"
                                    : task.caseLine.status === "IN_REPAIR"
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                Work Item Status
                              </p>
                            </div>
                            <p
                              className={`text-sm font-semibold ml-4 ${
                                task.caseLine.status === "WAITING_FOR_PARTS"
                                  ? "text-orange-900"
                                  : task.caseLine.status === "PARTS_AVAILABLE"
                                  ? "text-green-900"
                                  : task.caseLine.status === "READY_FOR_REPAIR"
                                  ? "text-purple-900"
                                  : task.caseLine.status === "IN_REPAIR"
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {task.caseLine.status.replace(/_/g, " ")}
                            </p>
                            {task.caseLine.status === "WAITING_FOR_PARTS" && (
                              <p className="text-xs text-orange-600 ml-4 mt-1">
                                ⚠️ Parts transfer request in progress -
                                technician cannot proceed yet
                              </p>
                            )}
                            {task.caseLine.status === "PARTS_AVAILABLE" && (
                              <p className="text-xs text-green-600 ml-4 mt-1">
                                ✓ Parts received - technician can start repair
                              </p>
                            )}
                          </div>
                        )}

                        {/* Case Line Details */}
                        {task.caseLine && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs font-semibold text-purple-700 mb-3">
                              Case Line Details
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-purple-600 mb-1">
                                  Diagnosis
                                </p>
                                <p className="text-sm text-purple-900">
                                  {task.caseLine.diagnosisText ||
                                    "No diagnosis provided"}
                                </p>
                              </div>

                              {task.caseLine.correctionText && (
                                <div>
                                  <p className="text-xs font-medium text-purple-600 mb-1">
                                    Correction
                                  </p>
                                  <p className="text-sm text-purple-900">
                                    {task.caseLine.correctionText}
                                  </p>
                                </div>
                              )}

                              <div>
                                <p className="text-xs font-medium text-purple-600 mb-1">
                                  Status
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-purple-900">
                                    {task.caseLine.status?.replace(/_/g, " ")}
                                  </p>
                                  {task.caseLine.warrantyStatus && (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        task.caseLine.warrantyStatus ===
                                        "ELIGIBLE"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {task.caseLine.warrantyStatus}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadTasks(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadTasks(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
