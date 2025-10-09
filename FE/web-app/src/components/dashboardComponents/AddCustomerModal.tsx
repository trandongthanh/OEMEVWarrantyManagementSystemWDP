"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ChevronDown } from "lucide-react";

export interface CustomerForm {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  idNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
  notes: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: CustomerForm) => void;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onAddCustomer,
}: AddCustomerModalProps) {
  const [formData, setFormData] = useState<CustomerForm>({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    idNumber: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setAlert({
        type: "error",
        message: "Full Name and Phone Number are required.",
      });
      return;
    }

    onAddCustomer(formData);
    setAlert({
      type: "success",
      message: `${formData.fullName} added successfully!`,
    });

    setFormData({
      fullName: "",
      phone: "",
      email: "",
      dob: "",
      gender: "",
      idNumber: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      emergencyName: "",
      emergencyPhone: "",
      notes: "",
    });

    setTimeout(() => {
      onClose();
      setAlert(null);
    }, 1200);
  };

  // màu hover/focus per section
  const sectionColors: Record<string, string> = {
    purple:
      "focus:border-purple-400 focus:ring-2 focus:ring-purple-300/60 hover:border-purple-400",
    blue: "focus:border-blue-400 focus:ring-2 focus:ring-blue-300/60 hover:border-blue-400",
    red: "focus:border-red-400 focus:ring-2 focus:ring-red-300/60 hover:border-red-400",
    yellow:
      "focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/60 hover:border-yellow-400",
    gray: "focus:border-gray-400 focus:ring-2 focus:ring-gray-300/60 hover:border-gray-400",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setAlert(null);
      }}
      size="3xl"
      backdrop="blur"
      className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white"
    >
      <ModalContent>
        <ModalHeader className="text-2xl font-bold text-white flex flex-col gap-1">
          Add New Customer
          <span className="text-sm font-normal text-gray-300">
            Register a new customer in the system
          </span>
        </ModalHeader>

        <ModalBody className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
          {/* Inline Alert */}
          {alert && (
            <div
              className={`p-3 rounded-md mb-4 ${
                alert.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-400/40"
                  : "bg-red-500/20 text-red-300 border border-red-400/40"
              }`}
            >
              {alert.message}
            </div>
          )}

          {[
            {
              title: "Personal Information",
              color: "purple",
              fields: [
                { placeholder: "Full Name *", field: "fullName" },
                { placeholder: "Phone Number *", field: "phone" },
                { placeholder: "Email", field: "email" },
                {
                  placeholder: "Date of Birth",
                  field: "dob",
                  inputType: "date",
                },
                { placeholder: "Gender", field: "gender", type: "select" },
                { placeholder: "ID Number", field: "idNumber" },
              ],
            },
            {
              title: "Address Information",
              color: "blue",
              fields: [
                { placeholder: "Street Address", field: "street" },
                { placeholder: "Ward", field: "ward" },
                { placeholder: "District", field: "district" },
                { placeholder: "City", field: "city" },
              ],
            },
            {
              title: "Emergency Contact",
              color: "red",
              fields: [
                { placeholder: "Contact Name", field: "emergencyName" },
                { placeholder: "Contact Phone", field: "emergencyPhone" },
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
                  f.type === "select" ? (
                    <Select
                      key={i}
                      placeholder="Select Gender"
                      value={formData.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      endContent={
                        <ChevronDown className="text-gray-200 w-4 h-4" />
                      }
                      classNames={{
                        trigger: `bg-slate-900/40 backdrop-blur-sm text-white placeholder-white/60 rounded-lg px-3 py-3 flex justify-between items-center border border-white/10 transition-all !shadow-none !outline-none ${
                          sectionColors[section.color]
                        }`,
                        listbox:
                          "bg-slate-800/80 backdrop-blur-xl text-white border border-white/20 rounded-lg shadow-lg",
                        popoverContent:
                          "bg-slate-800/80 backdrop-blur-xl text-white border border-white/20 rounded-lg",
                      }}
                    >
                      <SelectItem key="male">Male</SelectItem>
                      <SelectItem key="female">Female</SelectItem>
                    </Select>
                  ) : (
                    <Input
                      key={i}
                      type={f.inputType || "text"}
                      placeholder={f.placeholder}
                      value={formData[f.field as keyof CustomerForm]}
                      onChange={(e) => handleChange(f.field, e.target.value)}
                      classNames={{
                        inputWrapper: `bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none ${
                          sectionColors[section.color]
                        }`,
                        input: "text-white font-medium !outline-none",
                      }}
                    />
                  )
                )}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-visible">
            <div className="bg-gray-500/20 px-4 py-2 rounded-t-2xl border-b border-white/5">
              <p className="font-semibold text-gray-300 text-lg">
                Additional Notes
              </p>
            </div>
            <div className="p-4">
              <Textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                minRows={5}
                classNames={{
                  inputWrapper: `bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none ${sectionColors.gray}`,
                  input: "text-white font-medium !outline-none",
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-visible mt-6">
            <div className="bg-yellow-500/20 px-4 py-2 rounded-t-2xl border-b border-white/5">
              <p className="font-semibold text-yellow-300 text-lg">Summary</p>
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-200">
              <p>👤 Name: {formData.fullName || "-"}</p>
              <p>📞 Phone: {formData.phone || "-"}</p>
              <p>📧 Email: {formData.email || "-"}</p>
              <p>🎂 DOB: {formData.dob || "-"}</p>
              <p>⚧ Gender: {formData.gender || "-"}</p>
              <p>🆔 ID Number: {formData.idNumber || "-"}</p>
              <p>
                🏠 Address:{" "}
                {[
                  formData.street,
                  formData.ward,
                  formData.district,
                  formData.city,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
              <p>
                🚨 Emergency:{" "}
                {formData.emergencyName && formData.emergencyPhone
                  ? `${formData.emergencyName} (${formData.emergencyPhone})`
                  : "-"}
              </p>
              <p>📝 Notes: {formData.notes || "-"}</p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-white/10 pt-4 flex justify-end gap-3">
          <Button
            variant="flat"
            onPress={() => {
              onClose();
              setAlert(null);
            }}
            className="text-gray-200 border border-white/20 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-sm"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg hover:from-purple-500 hover:to-blue-500 backdrop-blur-sm"
            onPress={handleSubmit}
          >
            ✅ Add Customer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
