"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Wrench,
  CheckCircle,
  Users,
} from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      title: "Active Claims",
      value: 24,
      change: +2.5,
      changeType: "increase" as const,
      color: "text-blue-200",
      gradient: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-400/30",
      hoverBorderColor: "hover:border-blue-400/50",
      icon: FileText,
      iconColor: "text-blue-400",
    },
    {
      title: "Pending Repairs",
      value: 12,
      change: -1.2,
      changeType: "decrease" as const,
      color: "text-amber-200",
      gradient: "from-amber-500/20 to-amber-600/20",
      borderColor: "border-amber-400/30",
      hoverBorderColor: "hover:border-amber-400/50",
      icon: Wrench,
      iconColor: "text-amber-400",
    },
    {
      title: "Completed Today",
      value: 8,
      change: +5.8,
      changeType: "increase" as const,
      color: "text-green-200",
      gradient: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-400/30",
      hoverBorderColor: "hover:border-green-400/50",
      icon: CheckCircle,
      iconColor: "text-green-400",
    },
    {
      title: "Active Technicians",
      value: 6,
      change: 0,
      changeType: "neutral" as const,
      color: "text-purple-200",
      gradient: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-400/30",
      hoverBorderColor: "hover:border-purple-400/50",
      icon: Users,
      iconColor: "text-purple-400",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const getChangeIcon = (changeType: "increase" | "decrease" | "neutral") => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-3 h-3" />;
      case "decrease":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = (changeType: "increase" | "decrease" | "neutral") => {
    switch (changeType) {
      case "increase":
        return "text-green-400";
      case "decrease":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            variants={item}
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 30 },
            }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-5 rounded-xl cursor-pointer
              bg-gradient-to-br ${stat.gradient}
              border ${stat.borderColor} ${stat.hoverBorderColor}
              hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
              backdrop-blur-xl
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
              group overflow-hidden
            `}
            tabIndex={0}
            role="button"
            aria-label={`${stat.title}: ${stat.value}`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors`}
                >
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {stat.title}
                </h3>
              </div>

              {/* Change Indicator */}
              <div
                className={`flex items-center space-x-1 ${getChangeColor(
                  stat.changeType
                )} text-xs`}
              >
                {getChangeIcon(stat.changeType)}
                <span className="font-medium">
                  {stat.change === 0
                    ? "0"
                    : `${stat.change > 0 ? "+" : ""}${stat.change}%`}
                </span>
              </div>
            </div>

            {/* Value */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: index * 0.1 + 0.2,
                type: "spring",
                stiffness: 200,
              }}
            >
              <p
                className={`text-3xl font-extrabold ${stat.color} mb-2 group-hover:scale-105 transition-transform`}
              >
                {stat.value}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.gradient.replace(
                    "/20",
                    "/60"
                  )} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stat.value * 3, 100)}%` }}
                  transition={{
                    delay: index * 0.1 + 0.4,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              </div>

              {/* Subtle Animation Dots */}
              <div className="flex justify-between mt-2 opacity-60">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-white/30 rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.gradient.replace(
                  "/20",
                  "/5"
                )} blur-sm`}
              ></div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
