"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Plus, UserPlus } from "lucide-react";
import AddCustomerModal, { CustomerForm } from "./AddCustomerModal";
import RegisterVehicleModal, { VehicleForm } from "./AddVehicleModal";

export default function VehicleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Mock data tạm thời trong state
  const [customers, setCustomers] = useState<CustomerForm[]>([
    {
      fullName: "John Doe",
      phone: "0123456789",
      email: "john@example.com",
      dob: "1990-01-01",
      gender: "Male",
      idNumber: "123456789",
      street: "123 Main St",
      ward: "Ward 1",
      district: "District A",
      city: "City X",
      emergencyName: "Jane Doe",
      emergencyPhone: "0987654321",
      notes: "VIP customer",
    },
    {
      fullName: "Alice Smith",
      phone: "0987654321",
      email: "alice@example.com",
      dob: "1992-05-15",
      gender: "Female",
      idNumber: "987654321",
      street: "456 Side St",
      ward: "Ward 2",
      district: "District B",
      city: "City Y",
      emergencyName: "",
      emergencyPhone: "",
      notes: "",
    },
  ]);

  const [vehicles, setVehicles] = useState<VehicleForm[]>([
    {
      vin: "1HGCM82633A004352",
      model: "Tesla Model 3",
      year: "2023",
      customer: "John Doe",
      color: "Red",
      batteryCapacity: "75 kWh",
      motorType: "Dual Motor",
      dealer: "Tesla Center X",
      purchaseDate: "2023-01-15",
      warrantyStart: "2023-01-15",
      warrantyEnd: "2031-01-15",
    },
    {
      vin: "2FTRX18W1XCA12345",
      model: "Ford F-150",
      year: "2022",
      customer: "Alice Smith",
      color: "Blue",
      batteryCapacity: "N/A",
      motorType: "V6 Engine",
      dealer: "Ford Dealer Y",
      purchaseDate: "2022-06-20",
      warrantyStart: "2022-06-20",
      warrantyEnd: "2027-06-20",
    },
  ]);

  return (
    <div
      className="
        p-6 rounded-2xl
        bg-gradient-to-br from-white/5 to-white/0
        backdrop-blur-2xl
        border border-white/20
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        transition-all
      "
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Vehicle & Customer Management
        </h2>
        <p className="text-sm text-gray-400">
          Register vehicles, manage customer profiles and service history
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          onPress={() => setIsVehicleModalOpen(true)}
          className="bg-gradient-to-r from-[#7c3aed] to-[#9f67ff] text-white 
          shadow-[0_0_15px_#7c3aed88] hover:shadow-[0_0_25px_#a855f7aa] 
          hover:from-[#8b5cf6] hover:to-[#b48dff] transition-all duration-300"
          startContent={<Plus size={18} />}
        >
          Register New Vehicle
        </Button>

        <Button
          onPress={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white 
          shadow-[0_0_15px_#3b82f688] hover:shadow-[0_0_25px_#60a5faa8]
          hover:from-[#60a5fa] hover:to-[#93c5fd] transition-all duration-300"
          startContent={<UserPlus size={18} />}
        >
          Add Customer
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="
            bg-gradient-to-br from-white/5 to-black/30
            backdrop-blur-xl
            border border-white/20
            hover:border-purple-400/50
            hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]
            transition-all duration-300 rounded-xl
          "
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-1">
              Vehicle Info
            </h3>
            <p className="text-sm text-gray-400">
              VIN registration, model details, warranty dates
            </p>
          </div>
        </Card>

        <Card
          className="
            bg-gradient-to-br from-white/5 to-black/30
            backdrop-blur-xl
            border border-white/20
            hover:border-blue-400/50
            hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]
            transition-all duration-300 rounded-xl
          "
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-1">
              Customer Details
            </h3>
            <p className="text-sm text-gray-400">
              Personal information, contact details, history
            </p>
          </div>
        </Card>

        <Card
          className="
            bg-gradient-to-br from-white/5 to-black/30
            backdrop-blur-xl
            border border-white/20
            hover:border-green-400/50
            hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]
            transition-all duration-300 rounded-xl
          "
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-1">
              Service History
            </h3>
            <p className="text-sm text-gray-400">
              Timeline of services, repairs, and maintenance
            </p>
          </div>
        </Card>
      </div>

      {/* Customer List
      <div className="space-y-4">
        {customers.length === 0 && (
          <p className="text-gray-500">No customers added yet.</p>
        )}

        {customers.map((c, idx) => (
          <Card
            key={idx}
            className="
              bg-gradient-to-br from-white/5 to-black/30
              backdrop-blur-xl
              border border-white/20
              p-5 rounded-xl
              hover:border-purple-400/60
              hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]
              transition-all duration-300
            "
          >
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
              <p>
                <span className="text-gray-400">👤 Name:</span> {c.fullName}
              </p>
              <p>
                <span className="text-gray-400">📞 Phone:</span> {c.phone}
              </p>
              <p>
                <span className="text-gray-400">📧 Email:</span>{" "}
                {c.email || "-"}
              </p>
              <p>
                <span className="text-gray-400">🎂 DOB:</span> {c.dob || "-"}
              </p>
              <p>
                <span className="text-gray-400">⚧ Gender:</span>{" "}
                {c.gender || "-"}
              </p>
              <p>
                <span className="text-gray-400">🆔 ID Number:</span>{" "}
                {c.idNumber || "-"}
              </p>
              <p className="md:col-span-2">
                <span className="text-gray-400">🏠 Address:</span>{" "}
                {[c.street, c.ward, c.district, c.city]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
              <p>
                <span className="text-gray-400">🚨 Emergency:</span>{" "}
                {c.emergencyName && c.emergencyPhone
                  ? `${c.emergencyName} (${c.emergencyPhone})`
                  : "-"}
              </p>
              <p>
                <span className="text-gray-400">📝 Notes:</span>{" "}
                {c.notes || "-"}
              </p>
            </div>
          </Card>
        ))}
      </div> */}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCustomer={(newCustomer) =>
          setCustomers((prev) => [...prev, newCustomer])
        }
      />

      {/* Add Vehicle Modal */}
      <RegisterVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        customers={customers.map((c) => c.fullName)}
        onAddVehicle={(newVehicle) =>
          setVehicles((prev) => [...prev, newVehicle])
        }
      />
    </div>
  );
}
