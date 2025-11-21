"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import workScheduleService, {
  WorkSchedule,
} from "@/services/workScheduleService";
import { toast } from "sonner";

type ViewMode = "week" | "month";

export function MySchedule() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadMySchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode]);

  const loadMySchedule = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const response = await workScheduleService.getMySchedule({
        startDate,
        endDate,
      });

      console.log("📅 Schedule API response:", response);

      // Handle both response formats:
      // 1. data.schedules (expected format)
      // 2. data as array (actual API response)
      const schedulesData = Array.isArray(response.data)
        ? response.data
        : response.data.schedules;

      console.log("📋 Parsed schedules:", schedulesData);
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast.error("Failed to load your schedule");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "week") {
      // Get start of week (Monday)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      // Get end of week (Sunday)
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // Get start of month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      // Get end of month
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getDisplayDate = () => {
    if (viewMode === "week") {
      const { startDate, endDate } = getDateRange();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return schedules?.filter((s) => s.workDate === dateStr) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "UNAVAILABLE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderWeekView = () => {
    const { startDate } = getDateRange();
    const weekStart = new Date(startDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-3">
        {days.map((date, index) => {
          const daySchedules = getScheduleForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-xl p-4 min-h-[180px] transition-all hover:shadow-md ${
                isToday
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm"
                  : isWeekend
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-center mb-3 pb-3 border-b border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    isToday ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <motion.div
                    key={schedule.scheduleId}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`p-3 rounded-lg border-2 text-xs ${getStatusColor(
                      schedule.status
                    )} shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold uppercase tracking-wide">
                        {schedule.status}
                      </span>
                      <Clock className="w-4 h-4" />
                    </div>
                    {schedule.notes && (
                      <div className="text-[10px] opacity-75 mt-1 line-clamp-2">
                        📝 {schedule.notes}
                      </div>
                    )}
                  </motion.div>
                ))}
                {daySchedules.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-6">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-300" />
                    </div>
                    <span>No schedule</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-700 py-3 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="border-0" />;
          }

          const daySchedules = getScheduleForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const hasSchedule = daySchedules.length > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`border rounded-xl p-2 min-h-[100px] transition-all hover:shadow-md cursor-pointer ${
                isToday
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-200"
                  : isWeekend
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`text-sm font-bold mb-2 flex items-center justify-between ${
                  isToday ? "text-blue-600" : "text-gray-700"
                }`}
              >
                <span>{date.getDate()}</span>
                {hasSchedule && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>
              <div className="space-y-1">
                {daySchedules.slice(0, 2).map((schedule) => (
                  <div
                    key={schedule.scheduleId}
                    className={`text-[10px] p-1.5 rounded-md font-medium ${getStatusColor(
                      schedule.status
                    )}`}
                  >
                    {schedule.status}
                  </div>
                ))}
                {daySchedules.length > 2 && (
                  <div className="text-[10px] text-gray-500 font-medium">
                    +{daySchedules.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              My Schedule
            </h2>
            <p className="text-sm text-gray-500 mt-2 ml-13">
              View and manage your work availability
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">
                {getDisplayDate()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={navigateToday}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading schedule...</span>
            </div>
          ) : (
            <>
              {viewMode === "week" ? renderWeekView() : renderMonthView()}

              {schedules?.length === 0 && !loading && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No schedule for this period</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Contact your manager if you need to be scheduled
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Legend & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              Status Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 border-2 border-green-200 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    Available
                  </div>
                  <div className="text-xs text-gray-500">
                    Ready to work on tasks
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 border-2 border-red-200 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    Unavailable
                  </div>
                  <div className="text-xs text-gray-500">
                    Off duty or on leave
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6"
          >
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-indigo-600 rounded-full" />
              Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Days Scheduled:</span>
                <span className="font-bold text-gray-900">
                  {schedules?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available Days:</span>
                <span className="font-bold text-green-600">
                  {schedules?.filter((s) => s.status === "AVAILABLE").length ||
                    0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unavailable Days:</span>
                <span className="font-bold text-red-600">
                  {schedules?.filter((s) => s.status === "UNAVAILABLE")
                    .length || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
