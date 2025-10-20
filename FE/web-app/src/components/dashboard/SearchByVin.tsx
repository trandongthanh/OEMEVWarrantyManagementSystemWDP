"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Search } from "lucide-react";
import vehicleService from "@/services/vehicleService";

interface Vehicle {
  vin: string;
  dateOfManufacture: string | null;
  placeOfManufacture: string | null;
  licensePlate: string | null;
  purchaseDate: string | null;
  owner: string | null;
  model: string | null;
  company: string | null;
}

// 👇 Thêm prop onVehicleFound vào component
export default function SearchByVin({
  onVehicleFound,
}: {
  onVehicleFound?: (vehicle: Vehicle) => void;
}) {
  const [value, setValue] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [newInfo, setNewInfo] = useState({
    licensePlate: "",
    purchaseDate: "",
    owner: "",
  });
  const [formError, setFormError] = useState("");

  // Các field đang thiếu
  const getMissingFields = (v: Vehicle | null) => {
    if (!v) return [];
    const missing: string[] = [];
    if (!v.licensePlate) missing.push("licensePlate");
    if (!v.purchaseDate) missing.push("purchaseDate");
    if (!v.owner) missing.push("owner");
    return missing;
  };

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormError("");
      setNewInfo({ licensePlate: "", purchaseDate: "", owner: "" });
    }
  }, [isOpen]);

  // --- Gọi API lấy thông tin xe bằng service ---
const fetchVehicle = async (vin: string) => {
  try {
    setError(null);
    setVehicle(null);

    // ⚙️ Gọi API qua service
    const response = await vehicleService.findVehicleByVin(vin);

    // ✅ Lấy ra object vehicle bên trong response
    const v = response.data.vehicle;

    // ✅ Format lại dữ liệu nhận được
    const fetchedVehicle: Vehicle = {
      vin: v.vin,
      dateOfManufacture: v.dateOfManufacture ?? null,
      placeOfManufacture: v.placeOfManufacture ?? null,
      licensePlate: v.licensePlate ?? null,
      purchaseDate: v.purchaseDate ?? null,
      owner: v.owner?.fullName ?? null,
      model: v.model ?? null,
      company: v.company ?? null,
    };

    // ✅ Cập nhật state và gọi callback
    setVehicle(fetchedVehicle);
    setError(null);
    setStep(1);
    onOpen();

    if (onVehicleFound) onVehicleFound(fetchedVehicle);
  } catch (err: any) {
    console.error("🚨 Lỗi khi lấy thông tin xe:", err);

    const message =
      err?.response?.data?.message ||
      "Không thể kết nối tới server hoặc VIN không tồn tại.";
    setError(message);
    setVehicle(null);
    setStep(1);
    onOpen();
  }
};

  // --- Xử lý input ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (newValue.length > 17) newValue = newValue.slice(0, 17);
    setValue(newValue);
  };

  const triggerSearch = () => {
    if (value.length === 17) {
      fetchVehicle(value);
    } else {
      setError("VIN phải đủ 17 ký tự.");
      setVehicle(null);
      onOpen();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerSearch();
  };

  // --- Step 2: Lưu thông tin còn thiếu ---
  const handleSave = () => {
    if (!vehicle) {
      setFormError("Không có thông tin xe để cập nhật.");
      return;
    }

    const missing = getMissingFields(vehicle);
    const requiredMissing: string[] = [];

    if (!vehicle.licensePlate && !newInfo.licensePlate)
      requiredMissing.push("Biển số xe");
    if (!vehicle.purchaseDate && !newInfo.purchaseDate)
      requiredMissing.push("Ngày mua");
    if (!vehicle.owner && !newInfo.owner) requiredMissing.push("Chủ sở hữu");

    if (requiredMissing.length > 0) {
      setFormError(`Vui lòng nhập: ${requiredMissing.join(", ")}`);
      return;
    }

    // Cập nhật local state
    setVehicle({
      ...vehicle,
      licensePlate: newInfo.licensePlate || vehicle.licensePlate,
      purchaseDate: newInfo.purchaseDate || vehicle.purchaseDate,
      owner: newInfo.owner || vehicle.owner,
    });

    setFormError("");
    setStep(1);
    setNewInfo({ licensePlate: "", purchaseDate: "", owner: "" });

    // 🔧 Nếu muốn cập nhật server, có thể gọi:
    // await vehicleService.registerVehicleOwner(vehicle.vin, {...})
  };

  const formatDate = (v?: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const missingFields = getMissingFields(vehicle);

  // --- UI ---
  return (
    <>
      <div className="w-full">
        <Input
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search by VIN..."
          startContent={
            <Search
              className="text-gray-500 w-5 h-5 ml-1 mr-2 cursor-pointer"
              onClick={triggerSearch}
            />
          }
          className="rounded-xl text-black"
          classNames={{
            inputWrapper: [
              "bg-white border border-gray-300 hover:border-blue-400 focus-within:border-blue-500 shadow-sm transition-all",
              "hover:shadow-[0_0_8px_rgba(59,130,246,0.2)] focus-within:shadow-[0_0_12px_rgba(59,130,246,0.3)] h-12 rounded-xl",
            ],
            input: ["text-black placeholder:text-black pl-1 !outline-none"],
          }}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        backdrop="blur"
        placement="center"
      >
        <ModalContent className="bg-white text-gray-800 rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-6 transition-all">
          <ModalHeader className="flex justify-center text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
            {step === 1 ? "Thông tin xe" : "Nhập thông tin còn thiếu"}
          </ModalHeader>

          <ModalBody className="pt-6">
            {step === 1 && (
              <>
                {error ? (
                  <p className="text-center text-red-500 font-medium">
                    {error}
                  </p>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-white text-gray-700 font-semibold text-lg px-6 py-3 border-b border-gray-200">
                      Vehicle Details
                    </div>

                    <table className="w-full border-collapse">
                      <tbody>
                        {[
                          ["VIN", vehicle?.vin],
                          ["Model", vehicle?.model],
                          ["Company", vehicle?.company],
                          [
                            "Date of Manufacture",
                            vehicle?.dateOfManufacture
                              ? formatDate(vehicle.dateOfManufacture)
                              : null,
                          ],
                          ["Place of Manufacture", vehicle?.placeOfManufacture],
                          ["License Plate", vehicle?.licensePlate],
                          [
                            "Purchase Date",
                            vehicle?.purchaseDate
                              ? formatDate(vehicle.purchaseDate)
                              : null,
                          ],
                          ["Owner", vehicle?.owner],
                        ].map(([label, value], i) => (
                          <tr
                            key={i}
                            className="transition-all duration-150 hover:bg-gray-50"
                          >
                            <td className="w-1/3 text-gray-500 font-medium px-6 py-3 border-b border-gray-200">
                              {label}
                            </td>
                            <td className="text-gray-900 font-semibold px-6 py-3 border-b border-gray-200 text-right break-all">
                              {value ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {missingFields.includes("licensePlate") && (
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        License Plate
                      </label>
                      <input
                        type="text"
                        placeholder="Enter license plate"
                        value={newInfo.licensePlate || ""}
                        onChange={(e) =>
                          setNewInfo({
                            ...newInfo,
                            licensePlate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-blue-200 text-blue-900 placeholder-gray-400
                             hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm
                             focus:outline-none focus:ring-0"
                      />
                    </div>
                  )}

                  {missingFields.includes("purchaseDate") && (
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={newInfo.purchaseDate || ""}
                        onChange={(e) =>
                          setNewInfo({
                            ...newInfo,
                            purchaseDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-blue-200 text-blue-900
                             hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm
                             focus:outline-none focus:ring-0"
                      />
                    </div>
                  )}

                  {missingFields.includes("owner") && (
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">Owner</label>
                      <input
                        type="text"
                        placeholder="Enter owner's name"
                        value={newInfo.owner || ""}
                        onChange={(e) =>
                          setNewInfo({ ...newInfo, owner: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-blue-200 text-blue-900 placeholder-gray-400
                             hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm
                             focus:outline-none focus:ring-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>

          <div className="flex justify-end items-center border-t border-gray-200 pt-4 mt-4 gap-3">
            {step === 2 ? (
              <>
                <button
                  onClick={() => {
                    setFormError("");
                    setStep(1);
                  }}
                  className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenChange}
                  className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>

                {missingFields.length > 0 ? (
                  <button
                    onClick={() => {
                      setFormError("");
                      setNewInfo({
                        licensePlate: "",
                        purchaseDate: "",
                        owner: "",
                      });
                      setStep(2);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                  >
                    Enter Missing Info
                  </button>
                ) : (
                  <button
                    onClick={onOpenChange}
                    className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Close
                  </button>
                )}
              </>
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}


