"use client";

import { useState, useEffect, useRef } from "react";
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
  Download,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import workScheduleService, {
  WorkSchedule,
} from "@/services/workScheduleService";
import { toast } from "sonner";

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
    errors?: Array<{
      row: number;
      message: string;
    }>;
  } | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const blob = await workScheduleService.downloadBulkCreateTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "work_schedules_bulk_create_template.xlsx";
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const response = await workScheduleService.uploadSchedules(selectedFile);
      console.log("📊 Upload response:", response);

      const totalProcessed = response.data?.totalProcessed || 0;
      const created = response.data?.created || 0;
      const updated = response.data?.updated || 0;
      const errorCount = response.data?.errorCount || 0;
      const errors = response.data?.errors || [];

      console.log("📋 Parsed values:", {
        totalProcessed,
        created,
        updated,
        errorCount,
        errors,
      });

      const result = {
        summary: {
          total: totalProcessed + errorCount,
          successful: created + updated,
          failed: errorCount,
        },
        errors: Array.isArray(errors)
          ? errors.map((errMsg, index) => ({
              row: index + 2,
              message: typeof errMsg === "string" ? errMsg : String(errMsg),
            }))
          : [],
      };

      console.log("✅ Setting upload result:", result);
      setUploadResult(result);

      if (errorCount === 0) {
        // Show success animation
        setUploadSuccess(true);
        toast.success(
          `Successfully imported ${
            created + updated
          } schedules! (${created} created, ${updated} updated)`
        );
        loadSchedules();
        // Close modal after showing success animation
        setTimeout(() => {
          handleCloseUploadModal();
        }, 3000);
      } else {
        toast.warning(
          `Imported ${created + updated} schedules, ${errorCount} failed`
        );
      }
    } catch (error: unknown) {
      console.error("Error uploading schedules:", error);
      const err = error as {
        response?: {
          data?: { message?: string; data?: { errors?: string[] } };
        };
      };

      // Handle backend error response
      const errorData = err.response?.data?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const result = {
          summary: {
            total: errorData.errors.length,
            successful: 0,
            failed: errorData.errors.length,
          },
          errors: errorData.errors.map((errMsg: string, index: number) => ({
            row: index + 2,
            message: errMsg,
          })),
        };
        setUploadResult(result);
      }

      toast.error(err.response?.data?.message || "Failed to upload schedules");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadResult(null);
      setUploadSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowUploadModal(false);
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseUploadModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bulk Upload Work Schedules
                  </h2>
                  <p className="text-sm text-gray-500">
                    Upload Excel file to create multiple work schedules
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseUploadModal}
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
                      Fill in schedule data (Employee Code, Work Date, Status,
                      Notes)
                    </li>
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

              {/* File Upload Area */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Excel File
                </label>

                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-colors
                    ${
                      selectedFile
                        ? "border-blue-300 bg-blue-50"
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
                  {uploadSuccess && uploadResult.summary.failed === 0 && (
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
                        Upload Successful!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-gray-600"
                      >
                        {uploadResult.summary.successful} schedules imported
                        successfully
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Stats - Show only if there are errors or not in success animation */}
                  {(!uploadSuccess || uploadResult.summary.failed > 0) && (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {uploadResult.summary.total}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-600 mb-1">
                            Successful
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {uploadResult.summary.successful}
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-xs text-red-600 mb-1">Failed</p>
                          <p className="text-2xl font-bold text-red-600">
                            {uploadResult.summary.failed}
                          </p>
                        </div>
                      </div>

                      {/* Error Details */}
                      {uploadResult.errors &&
                        uploadResult.errors.length > 0 && (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Errors:
                            </p>
                            {uploadResult.errors.map((error, index) => (
                              <div
                                key={index}
                                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                              >
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-red-700">
                                  <p className="font-medium">Row {error.row}</p>
                                  <p>{error.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseUploadModal}
                disabled={uploading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploadResult ? "Close" : "Cancel"}
              </button>
              {!uploadResult && (
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
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
                      Upload Schedules
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
