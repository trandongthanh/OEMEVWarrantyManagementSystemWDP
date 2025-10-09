"use client";

import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboardComponents/DashboardHeader";
import Beams from "@/components/Beams";
import { Wrench, AlertCircle, Clock, CheckCircle } from "lucide-react";

export default function TechnicianDashboard() {
  return (
    <div className="relative min-h-screen flex flex-col text-gray-100 overflow-hidden">
      {/* Beams Background */}
      <div className="absolute inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      {/* Enhanced overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="max-w-8xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Technician Dashboard
                </h1>
                <p className="text-xs text-gray-400">
                  Service & Repair Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-20 flex-1 overflow-auto">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 py-8">
          <DashboardHeader />

          {/* Coming Soon Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Technician Dashboard
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                This dashboard will display your assigned repair tasks,
                diagnostic tools, parts inventory, and service completion
                tracking.
              </p>

              {/* Placeholder Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">
                    Assigned Tasks
                  </h3>
                  <p className="text-gray-400 text-sm">
                    View and manage your repair assignments
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">In Progress</h3>
                  <p className="text-gray-400 text-sm">
                    Track ongoing repair work
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Completed</h3>
                  <p className="text-gray-400 text-sm">
                    Review finished service records
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
