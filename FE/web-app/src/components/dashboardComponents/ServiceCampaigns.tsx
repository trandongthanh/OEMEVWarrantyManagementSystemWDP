"use client";

import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

export default function ServiceCampaigns() {
  const campaigns = [
    {
      title: "Battery Software Update Campaign",
      desc: "Affects 2022–2023 EV models – Critical safety update",
    },
  ];

  return (
    <div
      className="
        rounded-xl p-6 mb-6
        bg-gradient-to-br from-white/5 to-black/10
        border border-gray-600/30
        hover:border-gray-500/50
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        backdrop-blur-2xl
        transition-all duration-200
      "
    >
      <h2 className="text-xl font-bold text-white mb-1">Service Campaigns</h2>
      <p className="text-sm text-gray-300 mb-4">
        Manage recall campaigns and customer notifications
      </p>

      {campaigns.map((c) => (
        <Card
          key={c.title}
          className="
            p-4 mb-4 rounded-xl
            bg-gradient-to-br from-white/8 to-black/15
            border border-gray-600/40
            hover:border-gray-500/60
            hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
            backdrop-blur-xl
            transition-all duration-200 transform hover:scale-[1.02]
          "
        >
          <div className="flex items-center justify-between gap-4">
            {/* Text bên trái */}
            <div>
              <h3 className="font-semibold text-white">{c.title}</h3>
              <p className="text-sm text-gray-300">{c.desc}</p>
            </div>

            {/* Buttons bên phải */}
            <div className="flex gap-2">
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
                Send Notifications
              </Button>

              <Button
                className="
                  h-10 px-5
                  text-black font-semibold
                  bg-gradient-to-br from-gray-200 to-gray-300
                  hover:from-gray-100 hover:to-gray-200
                  hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]
                  rounded-xl
                  transition-all duration-200
                "
              >
                Manage Schedule
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
