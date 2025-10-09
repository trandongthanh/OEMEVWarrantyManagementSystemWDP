"use client";

import { Button } from "@heroui/button";
import { FileText } from "lucide-react";

export default function RecentWarrantyClaims() {
  const claims = [
    {
      id: "WC-2024-001",
      vin: "1HGBH41JXMN109186",
      customer: "Nguyễn Văn A",
      issue: "Battery Performance Issue",
      technician: "Trần Minh B",
      date: "2024-01-15",
      status: "Chờ duyệt",
    },
    {
      id: "WC-2024-002",
      vin: "WWVZZZ1JZ3W386752",
      customer: "Lê Thị C",
      issue: "Motor Controller Fault",
      technician: "Phạm Văn D",
      date: "2024-01-14",
      status: "Đã duyệt",
    },
    {
      id: "WC-2024-003",
      vin: "1N4AL11D75C109151",
      customer: "Hoàng Minh E",
      issue: "Charging System Error",
      technician: "Võ Thị F",
      date: "2024-01-13",
      status: "Đang sửa",
    },
  ];

  return (
    <div
      className="
        rounded-xl p-8 mb-6
        bg-gradient-to-br from-white/5 to-black/10
        border border-gray-600/30
        hover:border-gray-500/50
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        backdrop-blur-2xl
        transition-all duration-200
      "
    >
      <h2 className="text-xl font-bold text-white mb-1">
        Recent Warranty Claims
      </h2>
      <p className="text-sm text-gray-300 mb-4">
        Manage warranty claims and track their progress
      </p>

      {/* 👉 Sử dụng space-y-4 để tạo khoảng cách giữa các item */}
      <div className="space-y-4">
        {claims.map((c) => (
          <div
            key={c.id}
            className="
              flex items-center justify-between
              p-5
              bg-white/5 rounded-lg
              hover:bg-white/10 transition-colors
            "
          >
            {/* Bên trái */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 border border-gray-500/40">
                <FileText size={16} className="text-gray-200" />
              </div>

              {/* Nội dung */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-200 bg-white/10 border border-gray-500/40 px-2 py-0.5 rounded-md">
                    {c.id}
                  </span>
                  {c.status && (
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-md font-medium
                        ${
                          c.status === "Đang sửa"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/40"
                            : c.status === "Đã duyệt"
                            ? "bg-green-500/20 text-green-300 border border-green-400/40"
                            : "bg-orange-500/20 text-orange-300 border border-orange-400/40"
                        }
                      `}
                    >
                      {c.status}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-300">
                  VIN:{" "}
                  <span className="font-medium text-gray-200">{c.vin}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Customer:{" "}
                  <span className="font-medium text-gray-200">
                    {c.customer}
                  </span>
                </p>
                <p className="font-semibold text-white">{c.issue}</p>
                <p className="text-sm text-gray-400">
                  Tech: <span className="text-gray-200">{c.technician}</span> —{" "}
                  {c.date}
                </p>
              </div>
            </div>

            {/* Bên phải */}
            <Button
              variant="flat"
              className="
                h-10 px-4
                bg-gradient-to-br from-white/10 to-black/20
                border border-gray-600/40
                hover:border-gray-500/60
                hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]
                text-gray-200
                rounded-xl
                transition-all duration-200
              "
            >
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Xem tất cả */}
      <div className="mt-6 text-center">
        <Button
          variant="flat"
          className="
            h-10 px-5
            bg-gradient-to-br from-white/10 to-black/20
            border border-gray-600/40
            hover:border-gray-500/60
            hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]
            text-gray-200
            rounded-xl
            transition-all duration-200
          "
        >
          View All Claims
        </Button>
      </div>
    </div>
  );
}
