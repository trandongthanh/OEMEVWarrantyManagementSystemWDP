"use client";

import { motion } from "framer-motion";
import Dock from "./Dock";
import {
  FileText,
  Car,
  Wrench,
  Megaphone,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type DashboardSwitchProps = {
  tab: "warranty" | "vehicles" | "repairs" | "campaigns";
  setTab: (tab: "warranty" | "vehicles" | "repairs" | "campaigns") => void;
};

export default function DashboardSwitch({ tab, setTab }: DashboardSwitchProps) {
  const { logout } = useAuth();
  const dockItems = [
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <FileText
            size={22}
            className={
              tab === "warranty"
                ? "text-blue-400 drop-shadow-[0_0_8px_rgb(96,165,250)]"
                : "text-gray-300 hover:text-white"
            }
          />
          {tab === "warranty" && (
            <motion.div
              className="absolute -inset-2 bg-blue-400/20 rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ),
      label: "Warranty Claims",
      onClick: () => setTab("warranty"),
    },
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Car
            size={22}
            className={
              tab === "vehicles"
                ? "text-purple-400 drop-shadow-[0_0_8px_rgb(192,132,252)]"
                : "text-gray-300 hover:text-white"
            }
          />
          {tab === "vehicles" && (
            <motion.div
              className="absolute -inset-2 bg-purple-400/20 rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ),
      label: "Vehicle Management",
      onClick: () => setTab("vehicles"),
    },
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Wrench
            size={22}
            className={
              tab === "repairs"
                ? "text-cyan-400 drop-shadow-[0_0_8px_rgb(34,211,238)]"
                : "text-gray-300 hover:text-white"
            }
          />
          {tab === "repairs" && (
            <motion.div
              className="absolute -inset-2 bg-cyan-400/20 rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ),
      label: "Repairs",
      onClick: () => setTab("repairs"),
    },
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Megaphone
            size={22}
            className={
              tab === "campaigns"
                ? "text-emerald-400 drop-shadow-[0_0_8px_rgb(52,211,153)]"
                : "text-gray-300 hover:text-white"
            }
          />
          {tab === "campaigns" && (
            <motion.div
              className="absolute -inset-2 bg-emerald-400/20 rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.div>
      ),
      label: "Campaigns",
      onClick: () => setTab("campaigns"),
    },
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings
            size={22}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          />
        </motion.div>
      ),
      label: "Settings",
      onClick: () => alert("Settings clicked!"),
    },
    {
      icon: (
        <motion.div
          whileHover={{ scale: 1.1, rotate: -180 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut
            size={22}
            className="text-red-400 hover:text-red-300 transition-colors duration-200"
          />
        </motion.div>
      ),
      label: "Logout",
      onClick: logout,
    },
  ];

  return (
    <Dock
      items={dockItems}
      spring={{ mass: 0.1, stiffness: 400, damping: 30 }}
      magnification={80}
      distance={140}
      panelHeight={72}
      dockHeight={280}
      baseItemSize={52}
    />
  );
}
