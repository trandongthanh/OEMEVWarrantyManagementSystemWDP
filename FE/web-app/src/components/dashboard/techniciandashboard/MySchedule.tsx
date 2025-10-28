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

      setSchedules(response.data.schedules);
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
    return schedules.filter((s) => s.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
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
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const daySchedules = getScheduleForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`border rounded-xl p-3 min-h-[150px] ${
                isToday
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xs text-gray-500 uppercase">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-2 rounded-lg border text-xs ${getStatusColor(
                      schedule.status
                    )}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{schedule.startTime}</span>
                    </div>
                    <div className="text-[10px] opacity-75">
                      {schedule.status}
                    </div>
                  </div>
                ))}
                {daySchedules.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    No shifts
                  </div>
                )}
              </div>
            </div>
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
            className="text-center text-xs font-semibold text-gray-600 py-2"
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

          return (
            <div
              key={index}
              className={`border rounded-lg p-2 min-h-[80px] ${
                isToday
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`text-sm font-semibold mb-1 ${
                  isToday ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {daySchedules.slice(0, 2).map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`text-[10px] p-1 rounded ${getStatusColor(
                      schedule.status
                    )}`}
                  >
                    {schedule.startTime}
                  </div>
                ))}
                {daySchedules.length > 2 && (
                  <div className="text-[10px] text-gray-500">
                    +{daySchedules.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">View your work schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

            {schedules.length === 0 && !loading && (
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

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-4"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
            <span className="text-sm text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
