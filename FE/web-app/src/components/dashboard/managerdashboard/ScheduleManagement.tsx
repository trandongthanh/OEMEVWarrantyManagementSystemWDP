"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Upload,
  User,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import workScheduleService, {
  WorkSchedule,
} from "@/services/workScheduleService";
import { toast } from "sonner";

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    technicianId: string;
    status?: "AVAILABLE" | "UNAVAILABLE";
  }>({
    startDate: "",
    endDate: "",
    technicianId: "",
    status: undefined,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<{
    status: "AVAILABLE" | "UNAVAILABLE";
    notes: string;
  }>({
    status: "AVAILABLE",
    notes: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await workScheduleService.getSchedules({
        ...filters,
        limit: 100, // Get more records for calendar view
      });

      setSchedules(response.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Please select an Excel file (.xlsx or .xls)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const response = await workScheduleService.uploadSchedules(selectedFile);

      const imported = response.data?.imported || 0;
      const failed = response.data?.failed || 0;

      toast.success(
        `Successfully imported ${imported} schedules${
          failed > 0 ? `. ${failed} failed.` : ""
        }`
      );

      if (response.data?.errors && response.data.errors.length > 0) {
        console.error("Upload errors:", response.data.errors);
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      loadSchedules();
    } catch (error) {
      console.error("Error uploading schedules:", error);
      toast.error("Failed to upload schedules");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";
      case "UNAVAILABLE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Group schedules by date for calendar view
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.workDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, WorkSchedule[]>);

  // Get unique technicians for summary
  const uniqueTechnicians = Array.from(
    new Set(schedules.map((s) => s.technicianId))
  );

  const getAvailabilityStats = () => {
    const available = schedules.filter((s) => s.status === "AVAILABLE").length;
    const unavailable = schedules.filter(
      (s) => s.status === "UNAVAILABLE"
    ).length;
    return { available, unavailable, total: schedules.length };
  };

  const stats = getAvailabilityStats();

  // Calendar generation helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDateKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const getSchedulesForDate = (day: number | null) => {
    if (!day) return [];
    const dateKey = formatDateKey(day);
    return groupedSchedules[dateKey] || [];
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const handleEditClick = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setEditFormData({
      status: schedule.status,
      notes: schedule.notes || "",
    });
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    setUpdating(true);
    try {
      await workScheduleService.updateSchedule(
        editingSchedule.scheduleId,
        editFormData
      );

      toast.success("Schedule updated successfully");
      setEditingSchedule(null);
      loadSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setUpdating(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const selectedDateSchedules = selectedDate
    ? groupedSchedules[selectedDate] || []
    : [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Work Schedule Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage technician work schedules and availability
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Excel
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && schedules.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Schedules
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Available</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.available}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Unavailable
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {stats.unavailable}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Technicians
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {uniqueTechnicians.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Quick Filters
              </h4>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value
                        ? (e.target.value as "AVAILABLE" | "UNAVAILABLE")
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      startDate: "",
                      endDate: "",
                      technicianId: "",
                      status: undefined,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No schedules found</p>
                <p className="text-gray-400 text-xs mt-1">
                  Upload an Excel file to create schedules
                </p>
              </div>
            ) : (
              <div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-600 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const daySchedules = getSchedulesForDate(day);
                    const availableCount = daySchedules.filter(
                      (s) => s.status === "AVAILABLE"
                    ).length;
                    const unavailableCount = daySchedules.filter(
                      (s) => s.status === "UNAVAILABLE"
                    ).length;
                    const hasSchedules = daySchedules.length > 0;
                    const dateKey = day ? formatDateKey(day) : null;
                    const isTodayDate = isToday(day);

                    return (
                      <motion.button
                        key={index}
                        onClick={() => day && setSelectedDate(dateKey)}
                        disabled={!day}
                        whileHover={day ? { scale: 1.02 } : {}}
                        whileTap={day ? { scale: 0.98 } : {}}
                        className={`
                          min-h-[100px] p-3 rounded-xl border-2 transition-all
                          ${
                            !day
                              ? "bg-transparent border-transparent cursor-default"
                              : ""
                          }
                          ${
                            day && !hasSchedules
                              ? "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
                              : ""
                          }
                          ${
                            day && hasSchedules
                              ? "bg-white border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                              : ""
                          }
                          ${
                            selectedDate === dateKey
                              ? "ring-2 ring-blue-500 ring-offset-2 border-blue-500"
                              : ""
                          }
                          ${isTodayDate ? "bg-blue-50 border-blue-400" : ""}
                        `}
                      >
                        {day && (
                          <div className="flex flex-col h-full">
                            {/* Day Number */}
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-bold ${
                                  isTodayDate
                                    ? "text-blue-600"
                                    : hasSchedules
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {day}
                              </span>
                              {isTodayDate && (
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                  Today
                                </span>
                              )}
                            </div>

                            {/* Schedule Indicators */}
                            {hasSchedules && (
                              <div className="flex-1 flex flex-col gap-1">
                                {availableCount > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>{availableCount}</span>
                                  </div>
                                )}
                                {unavailableCount > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{unavailableCount}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected Date Details */}
                {selectedDate && selectedDateSchedules.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-900">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedDateSchedules.map((schedule) => (
                        <div
                          key={schedule.scheduleId}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${
                                schedule.status === "AVAILABLE"
                                  ? "bg-gradient-to-br from-green-400 to-green-600"
                                  : "bg-gradient-to-br from-red-400 to-red-600"
                              }`}
                            >
                              {schedule.technician?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "??"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-gray-900 truncate">
                                  {schedule.technician?.name ||
                                    "Unknown Technician"}
                                </h5>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${getStatusColor(
                                    schedule.status
                                  )}`}
                                >
                                  {schedule.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">
                                  {schedule.technician?.email}
                                </span>
                              </div>
                              {schedule.notes && (
                                <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
                                  <p className="text-xs text-amber-900">
                                    📝 {schedule.notes}
                                  </p>
                                </div>
                              )}
                              <button
                                onClick={() => handleEditClick(schedule)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !updating && setEditingSchedule(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Schedule
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingSchedule.technician?.name} -{" "}
                  {new Date(editingSchedule.workDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setEditingSchedule(null)}
                disabled={updating}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as "AVAILABLE" | "UNAVAILABLE",
                    })
                  }
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors disabled:opacity-50"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                  disabled={updating}
                  rows={3}
                  placeholder="Add notes about this schedule..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingSchedule(null)}
                disabled={updating}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                disabled={updating}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Update
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Upload Schedule Excel
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Import schedules in bulk
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">
                    Excel Format Requirements:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Required: technicianId, date, startTime, endTime</li>
                    <li>Date format: YYYY-MM-DD</li>
                    <li>Time format: HH:MM (24-hour)</li>
                    <li>Optional: status, notes</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
