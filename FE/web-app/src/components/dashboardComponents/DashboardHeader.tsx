"use client";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Search } from "lucide-react";

import SearchInfor from "./SearchInfor";

interface DashboardHeaderProps {
  onNewClaimClick?: () => void;
}

export default function DashboardHeader({
  onNewClaimClick,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, Admin
        </h1>
        <p className="text-gray-400">
          Here&apos;s what&apos;s happening with your warranty system today.
        </p>
      </div>

      {/* Header Controls */}
      <div
        className="
          flex items-center justify-between gap-4
          bg-gradient-to-br from-white/10 to-black/40
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        "
      >
        {/* Search bar */}
        <div className="flex-1 max-w-md">
          <SearchInfor />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            className="
              h-12 px-6 text-white
              bg-gradient-to-br from-white/10 to-black/20
              backdrop-blur-xl
              border border-white/20
              hover:border-purple-400/60
              hover:shadow-[0_0_12px_rgba(167,139,250,0.2)]
              transition-all duration-200 rounded-xl
            "
          >
            Schedule
          </Button>

          <Button
            className="
              h-12 px-6 text-black font-semibold
              bg-gradient-to-br from-blue-400 to-blue-500
              hover:from-blue-300 hover:to-blue-400
              hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]
              transition-all duration-200 rounded-xl
            "
            onClick={onNewClaimClick}
          >
            + New Claim
          </Button>

          {/* Notifications dropdown */}
        </div>
      </div>
    </div>
  );
}
