"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Car,
  Wrench,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { userService, Technician } from "@/services";

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
  technician?: Technician;
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

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("ALL");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTechnicianId, setNewTechnicianId] = useState("");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const techsData = await userService.getTechnicians();
      setTechnicians(techsData);

      // TODO: Replace with actual task service once backend is ready
      // const tasksData = await taskService.getAllTasks({ status: statusFilter });
      // setTasks(tasksData);

      // Mock data for demonstration
      setTasks([]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setTechnicians([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleReassignTask = async () => {
    if (!selectedTask || !newTechnicianId) return;

    try {
      // TODO: Implement backend endpoint
      console.log("Reassign task:", selectedTask.taskId, newTechnicianId);
      alert(
        "Task reassignment not yet implemented in backend. See BACKEND_ANALYSIS.md"
      );
      // await taskService.reassign(selectedTask.taskId, newTechnicianId);
      // await fetchData();
      setShowReassignModal(false);
      setSelectedTask(null);
      setNewTechnicianId("");
    } catch (error) {
      console.error("Error reassigning task:", error);
      alert("Failed to reassign task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.guaranteeCase?.vin
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      task.guaranteeCase?.vehicle?.licensePlate
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      task.guaranteeCase?.contentGuarantee
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesTechnician =
      technicianFilter === "ALL" ||
      (technicianFilter === "UNASSIGNED" && !task.technicianId) ||
      task.technicianId === technicianFilter;

    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    const matchesTaskType =
      taskTypeFilter === "ALL" || task.taskType === taskTypeFilter;

    return (
      matchesSearch && matchesTechnician && matchesStatus && matchesTaskType
    );
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    unassigned: tasks.filter((t) => !t.technicianId).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-2" />
          <p className="text-gray-600">Loading tasks...</p>
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
            Tasks Overview
          </h1>
          <p className="text-gray-600">
            Monitor and manage all active tasks across all cases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="text-xs text-gray-500 mt-1">All tasks</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-xs text-gray-500 mt-1">Waiting to start</p>
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
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.unassigned}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Unassigned</p>
            <p className="text-xs text-gray-500 mt-1">Need assignment</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
          animate={{ opacity: refreshing ? 0.7 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VIN, license plate, or case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
              >
                <option value="ALL">All Technicians</option>
                <option value="UNASSIGNED">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.userId} value={tech.userId}>
                    {tech.name || tech.userId}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
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
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-gray-900 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl border border-gray-200 p-6"
            animate={{ opacity: refreshing ? 0.7 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {tasks.length === 0
                  ? "No tasks created yet"
                  : "No tasks match your filters"}
              </h4>
              <p className="text-gray-600">
                {tasks.length === 0
                  ? "Tasks will appear here once they are created in the Assignments tab"
                  : "Try adjusting your filters to see more tasks"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl border border-gray-200 p-6"
            animate={{ opacity: refreshing ? 0.7 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const typeInfo = taskTypeConfig[task.taskType];
                const statusInfo = taskStatusConfig[task.status];
                const TypeIcon = typeInfo.icon;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={task.taskId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Task Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
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

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            <span>{task.guaranteeCase?.vin}</span>
                          </div>
                          {task.technician && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                {task.technician.name || task.technician.userId}
                              </span>
                            </div>
                          )}
                          {!task.technicianId && (
                            <span className="text-orange-600 font-medium">
                              Unassigned
                            </span>
                          )}
                          {task.assignedAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Assigned:{" "}
                                {new Date(task.assignedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {task.status !== "COMPLETED" &&
                        task.status !== "CANCELLED" && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setNewTechnicianId(task.technicianId || "");
                              setShowReassignModal(true);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            {task.technicianId ? "Reassign" : "Assign"}
                          </button>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedTask.technicianId ? "Reassign Task" : "Assign Task"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Task Type:</p>
              <p className="font-medium">
                {taskTypeConfig[selectedTask.taskType].label}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Technician
              </label>
              <select
                value={newTechnicianId}
                onChange={(e) => setNewTechnicianId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select a technician...</option>
                {technicians.map((tech) => (
                  <option key={tech.userId} value={tech.userId}>
                    {tech.name || tech.userId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedTask(null);
                  setNewTechnicianId("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignTask}
                disabled={!newTechnicianId}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {selectedTask.technicianId ? "Reassign" : "Assign"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
