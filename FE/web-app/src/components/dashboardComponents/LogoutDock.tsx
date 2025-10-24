"use client";

import { motion } from "framer-motion";
import Dock from "./Dock";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutDock() {
  const { logout } = useAuth();

  const dockItems = [
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
      dockHeight={120}
      baseItemSize={52}
    />
  );
}
