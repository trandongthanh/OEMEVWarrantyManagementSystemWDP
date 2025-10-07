"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ChevronDown } from "lucide-react";

export interface VehicleForm {
  vin: string;
  model: string;
  year: string;
  customer: string;
  color: string;
  batteryCapacity: string;
  motorType: string;
  dealer: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
}

interface RegisterVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: string[];
  onAddVehicle: (vehicle: VehicleForm) => void;
}

export default function RegisterVehicleModal({
  isOpen,
  onClose,
  customers,
  onAddVehicle,
}: RegisterVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleForm>({
    vin: "",
    model: "",
    year: "",
    customer: "",
    color: "",
    batteryCapacity: "",
    motorType: "",
    dealer: "",
    purchaseDate: "",
    warrantyStart: "",
    warrantyEnd: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onAddVehicle(formData);
    setFormData({
      vin: "",
      model: "",
      year: "",
      customer: "",
      color: "",
      batteryCapacity: "",
      motorType: "",
      dealer: "",
      purchaseDate: "",
      warrantyStart: "",
      warrantyEnd: "",
    });
    onClose();
  };

  const sectionColors: Record<string, string> = {
    purple:
      "focus:border-purple-400 focus:ring-2 focus:ring-purple-300/60 hover:border-purple-400",
    blue: "focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 hover:border-blue-400",
    red: "focus:border-red-400 focus:ring-2 focus:ring-red-300/60 hover:border-red-400",
    yellow:
      "focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/60 hover:border-yellow-400",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      backdrop="blur"
      className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white"
    >
      <ModalContent>
        <ModalHeader className="text-2xl font-bold text-white flex flex-col gap-1">
          Register New Vehicle
          <span className="text-sm font-normal text-gray-300">
            Add a new vehicle to the system
          </span>
        </ModalHeader>

        <ModalBody className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
          {[
            {
              title: "Vehicle Information",
              color: "purple",
              fields: [
                { type: "input", placeholder: "VIN Number", field: "vin" },
                { type: "input", placeholder: "Model", field: "model" },
                {
                  type: "input",
                  placeholder: "Manufacturing Date",
                  field: "year",
                  inputType: "date", // ✅ Đổi thành date picker
                },
                {
                  type: "select",
                  placeholder: "Link to Customer",
                  field: "customer",
                },
              ],
            },
            {
              title: "Specifications",
              color: "blue",
              fields: [
                { type: "input", placeholder: "Color", field: "color" },
                {
                  type: "input",
                  placeholder: "Battery Capacity",
                  field: "batteryCapacity",
                },
                {
                  type: "input",
                  placeholder: "Motor Type",
                  field: "motorType",
                },
                {
                  type: "input",
                  placeholder: "Dealer Information",
                  field: "dealer",
                },
              ],
            },
            {
              title: "Warranty",
              color: "red",
              fields: [
                {
                  type: "input",
                  placeholder: "Purchase Date",
                  field: "purchaseDate",
                  inputType: "date",
                },
                {
                  type: "input",
                  placeholder: "Warranty Start Date",
                  field: "warrantyStart",
                  inputType: "date",
                },
                {
                  type: "input",
                  placeholder: "Warranty End Date",
                  field: "warrantyEnd",
                  inputType: "date",
                },
              ],
            },
          ].map((section, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-visible"
            >
              <div
                className={`px-4 py-2 rounded-t-2xl border-b border-white/5 bg-${section.color}-500/20`}
              >
                <p
                  className={`font-semibold text-${section.color}-300 text-lg`}
                >
                  {section.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5 p-4">
                {section.fields.map((f, i) =>
                  f.type === "input" ? (
                    <Input
                      key={i}
                      type={f.inputType || "text"}
                      placeholder={f.placeholder}
                      value={formData[f.field as keyof VehicleForm]}
                      onChange={(e) => handleChange(f.field, e.target.value)}
                      classNames={{
                        inputWrapper: `bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none ${
                          sectionColors[section.color]
                        }`,
                        input: "text-white font-medium !outline-none",
                      }}
                    />
                  ) : (
                    <Select
                      key={i}
                      placeholder={f.placeholder}
                      value={formData[f.field as keyof VehicleForm]}
                      onChange={(e) => handleChange(f.field, e.target.value)}
                      // ✅ Sửa icon & layout cân chỉnh đẹp hơn
                      classNames={{
                        trigger: `bg-slate-900/40 backdrop-blur-sm text-white placeholder-white/60 rounded-lg px-3 py-3 flex justify-between items-center border border-white/10 transition-all !shadow-none !outline-none ${
                          sectionColors[section.color]
                        }`,
                        value: "text-white font-medium",
                        selectorIcon:
                          "text-gray-300 w-4 h-4 absolute right-3 pointer-events-none",
                        listbox:
                          "bg-slate-800/80 backdrop-blur-xl text-white border border-white/20 rounded-lg shadow-lg",
                        popoverContent:
                          "bg-slate-800/80 backdrop-blur-xl text-white border border-white/20 rounded-lg",
                      }}
                    >
                      {customers.map((c, idx) => (
                        <SelectItem
                          key={idx}
                          className="hover:bg-white/20 data-[selected=true]:bg-white/30 data-[selected=true]:text-white rounded-md"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </Select>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-visible mt-6">
            <div className="bg-yellow-500/20 px-4 py-2 rounded-t-2xl border-b border-white/5">
              <p className="font-semibold text-yellow-300 text-lg">
                Registration Summary
              </p>
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-200">
              <p>VIN: {formData.vin || "-"}</p>
              <p>Model: {formData.model || "-"}</p>
              <p>Manufacturing Date: {formData.year || "-"}</p>
              <p>Customer: {formData.customer || "-"}</p>
              <p>Color: {formData.color || "-"}</p>
              <p>Battery Capacity: {formData.batteryCapacity || "-"}</p>
              <p>Motor Type: {formData.motorType || "-"}</p>
              <p>Dealer: {formData.dealer || "-"}</p>
              <p>Purchase Date: {formData.purchaseDate || "-"}</p>
              <p>Warranty Start: {formData.warrantyStart || "-"}</p>
              <p>Warranty End: {formData.warrantyEnd || "-"}</p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-white/10 pt-4 flex justify-end gap-3">
          <Button
            variant="flat"
            onPress={onClose}
            className="text-gray-200 border border-white/20 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-sm"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg hover:from-purple-500 hover:to-blue-500 backdrop-blur-sm"
            onPress={handleSubmit}
          >
            ✅ Register Vehicle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
