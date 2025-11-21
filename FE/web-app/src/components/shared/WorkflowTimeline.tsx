"use client";

import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
  status: string;
  timestamp: string | null;
  label: string;
  user?: {
    userId: string;
    name: string;
  } | null;
  description?: string;
}

interface WorkflowTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
  variant?: "vertical" | "horizontal";
}

export function WorkflowTimeline({
  events,
  currentStatus,
  variant = "vertical",
}: WorkflowTimelineProps) {
  const getStatusIcon = (event: TimelineEvent, index: number) => {
    const currentIndex = events.findIndex((e) => e.status === currentStatus);

    if (event.timestamp) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    } else if (index === currentIndex) {
      return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
    } else if (index < currentIndex) {
      return <XCircle className="w-5 h-5 text-gray-400" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (event: TimelineEvent, index: number) => {
    const currentIndex = events.findIndex((e) => e.status === currentStatus);

    if (event.timestamp) {
      return "border-green-600 bg-green-50";
    } else if (index === currentIndex) {
      return "border-blue-600 bg-blue-50";
    } else {
      return "border-gray-300 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (variant === "horizontal") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {events.map((event, index) => (
          <div key={event.status} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center min-w-[120px]"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusColor(
                  event,
                  index
                )}`}
              >
                {getStatusIcon(event, index)}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700">
                  {event.label}
                </p>
                {event.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(event.timestamp)}
                  </p>
                )}
                {event.user && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {event.user.name}
                  </p>
                )}
              </div>
            </motion.div>

            {index < events.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-2 ${
                  event.timestamp ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.status}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${getStatusColor(
                event,
                index
              )}`}
            >
              {getStatusIcon(event, index)}
            </div>
            {index < events.length - 1 && (
              <div
                className={`w-0.5 flex-1 mt-2 ${
                  event.timestamp ? "bg-green-600" : "bg-gray-300"
                }`}
                style={{ minHeight: "40px" }}
              />
            )}
          </div>

          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {event.label}
                </h4>
                {event.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              {event.timestamp && (
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatTimestamp(event.timestamp)}
                </span>
              )}
            </div>
            {event.user && (
              <p className="text-xs text-gray-500 mt-1">by {event.user.name}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
