"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  Wrench,
  FileText,
  Loader2,
  Filter,
  ChevronDown,
  FileCheck,
} from "lucide-react";

// Task type definitions (will be moved to services once backend is ready)
interface Task {
  taskId: string;
  guaranteeCaseId: string;
  taskType: "DIAGNOSIS" | "REPAIR";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  technicianId: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  guaranteeCase?: {
    guaranteeCaseId: string;
    contentGuarantee: string;
    status: string;
    vin: string;
    vehicle?: {
      licensePlate: string;
      model?: string | { name: string };
    };
  };
}

const taskTypeConfig = {
  DIAGNOSIS: {
    label: "Diagnosis",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: FileText,
  },
  REPAIR: {
    label: "Repair",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: Wrench,
  },
};

const taskStatusConfig = {
  PENDING: {
    label: "Pending",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
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

interface MyTasksProps {
  onSubmitReport?: (task: Task) => void;
}

export function MyTasks({ onSubmitReport }: MyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE"); // ACTIVE, COMPLETED, ALL
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("ALL");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual task service once backend is ready
      // const userId = getCurrentUserId(); // Get from auth context
      // const tasksData = await taskService.getMyTasks(userId);
      // setTasks(tasksData);

      // Mock data for demonstration
      setTasks([]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      // TODO: Implement backend endpoint
      console.log("Start task:", taskId);
      alert(
        "Task status update not yet implemented in backend. See BACKEND_ANALYSIS.md"
      );
      // await taskService.updateStatus(taskId, "IN_PROGRESS");
      // await fetchTasks();
    } catch (error) {
      console.error("Error starting task:", error);
      alert("Failed to start task");
    }
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" &&
        (task.status === "PENDING" || task.status === "IN_PROGRESS")) ||
      (statusFilter === "COMPLETED" && task.status === "COMPLETED");

    const matchesTaskType =
      taskTypeFilter === "ALL" || task.taskType === taskTypeFilter;

    return matchesStatus && matchesTaskType;
  });

  const stats = {
    active: tasks.filter(
      (t) => t.status === "PENDING" || t.status === "IN_PROGRESS"
    ).length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    diagnosis: tasks.filter(
      (t) => t.taskType === "DIAGNOSIS" && t.status !== "COMPLETED"
    ).length,
    repair: tasks.filter(
      (t) => t.taskType === "REPAIR" && t.status !== "COMPLETED"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-2" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600 mt-1">
            Manage your assigned diagnosis and repair tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.active}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Active Tasks</p>
            <p className="text-xs text-gray-500 mt-1">Currently assigned</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.diagnosis}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Diagnosis Tasks</p>
            <p className="text-xs text-gray-500 mt-1">Diagnostic work</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.repair}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Repair Tasks</p>
            <p className="text-xs text-gray-500 mt-1">Repair work</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
            >
              <option value="ACTIVE">Active Tasks</option>
              <option value="COMPLETED">Completed</option>
              <option value="ALL">All Tasks</option>
            </select>

            <select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="DIAGNOSIS">Diagnosis</option>
              <option value="REPAIR">Repair</option>
            </select>

            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-gray-900"
            >
              <Filter className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {tasks.length === 0
                  ? "No tasks assigned yet"
                  : "No tasks match your filters"}
              </h4>
              <p className="text-gray-600">
                {tasks.length === 0
                  ? "Tasks will appear here once they are assigned to you"
                  : "Try adjusting your filters to see more tasks"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const typeInfo = taskTypeConfig[task.taskType];
                const statusInfo = taskStatusConfig[task.status];
                const TypeIcon = typeInfo.icon;
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedTasks.has(task.taskId);

                return (
                  <motion.div
                    key={task.taskId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Task Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleTaskExpanded(task.taskId)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}
                            >
                              <TypeIcon className="w-3 h-3 inline mr-1" />
                              {typeInfo.label}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2">
                            {task.guaranteeCase?.contentGuarantee ||
                              "No description"}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              <span>{task.guaranteeCase?.vin}</span>
                            </div>
                            {task.assignedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  Assigned:{" "}
                                  {new Date(
                                    task.assignedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
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
                          className="border-t border-gray-200 bg-gray-50 p-6"
                        >
                          {/* Vehicle Details */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Vehicle Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">VIN:</span>
                                <p className="font-medium">
                                  {task.guaranteeCase?.vin}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  License Plate:
                                </span>
                                <p className="font-medium">
                                  {task.guaranteeCase?.vehicle?.licensePlate ||
                                    "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Model:</span>
                                <p className="font-medium">
                                  {typeof task.guaranteeCase?.vehicle?.model ===
                                  "string"
                                    ? task.guaranteeCase.vehicle.model
                                    : task.guaranteeCase?.vehicle?.model
                                        ?.name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Case Status:
                                </span>
                                <p className="font-medium">
                                  {task.guaranteeCase?.status?.replace(
                                    /_/g,
                                    " "
                                  ) || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            {task.status === "PENDING" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTask(task.taskId);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Start Task
                              </button>
                            )}

                            {task.status === "IN_PROGRESS" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSubmitReport?.(task);
                                }}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                              >
                                <FileCheck className="w-4 h-4" />
                                Submit Report
                              </button>
                            )}

                            {task.status === "COMPLETED" &&
                              task.completedAt && (
                                <div className="flex-1 text-center py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                  Completed on{" "}
                                  {new Date(
                                    task.completedAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
