"use client";

import { motion } from "framer-motion";
import { Plus, Car, CheckCircle, AlertCircle, Users } from "lucide-react";
import SearchByVin from "../SearchByVin";

interface VehicleManagementProps {
  onRegisterVehicleClick: () => void;
}

export function VehicleManagement({
  onRegisterVehicleClick,
}: VehicleManagementProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Vehicle Management
          </h2>
          <p className="text-gray-600 mt-1">
            Register new vehicles and manage existing registrations
          </p>
             {/* Search */}
          <div className="mt-6 flex items-center justify-between">
            <div className="w-[420px]">
              <SearchByVin />
            </div>
            {/* Register Vehicle Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegisterVehicleClick}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Register Vehicle
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm font-medium text-gray-600">
              Registered Vehicles
            </p>
            <p className="text-xs text-gray-500 mt-1">Total registered</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Under Warranty</p>
            <p className="text-xs text-gray-500 mt-1">Active coverage</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Customers</p>
            <p className="text-xs text-gray-500 mt-1">Registered owners</p>
          </motion.div>
        </div>

        {/* Vehicles Table Placeholder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Registered Vehicles</h3>
          </div>

          {/* Empty State */}
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No vehicles registered yet
            </h4>
            <p className="text-gray-600 mb-6">
              Get started by registering your first vehicle
            </p>
            <button
              onClick={onRegisterVehicleClick}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Register Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
