"use client";

import { useState } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Search } from "lucide-react";

interface Vehicle {
  vin: string;
  dateOfManufacture: string;
  placeOfManufacture: string;
  licensePlate: string | null;
  purchaseDate: string | null;
  owner: string | null;
  model: string;
  company: string;
}

export default function SearchInfor() {
  const [value, setValue] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [newInfo, setNewInfo] = useState({
    licensePlate: "",
    purchaseDate: "",
    owner: "",
  });
  const [formError, setFormError] = useState("");

 // Call API lấy thông tin xe
  const fetchVehicle = async (vin: string) => {
    try {
      setError(null);
      setVehicle(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("⚠️ Token không tồn tại. Vui lòng đăng nhập lại.");
        onOpen();
        return;
      }

      const res = await fetch(`http://localhost:8000/api/v1/vehicles/${vin}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("🔍 API Response:", data);

      if (res.ok && data.status === "success" && data.data?.vehicle) {
        const v = data.data.vehicle;
        setVehicle({
          vin: v.vin,
          dateOfManufacture: v.dateOfManufacture,
          placeOfManufacture: v.placeOfManufacture,
          licensePlate: v.licensePlate,
          purchaseDate: v.purchaseDate,
          owner: v.customer?.fullName || null,
          model: v.model,
          company: v.company,
        });
        setError(null);
      } else if (res.status === 401) {
        setError("❌ 401: Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
      } else if (res.status === 403) {
        setError("🚫 403: Bạn không có quyền truy cập.");
      } else if (res.status === 404) {
        setError(data.message || "Không tìm thấy xe với VIN này.");
      } else {
        setError(data.message || "Lỗi không xác định từ server.");
      }

      setStep(1);
      onOpen();
    } catch (err) {
      console.error("🚨 Fetch error:", err);
      setError("Không thể kết nối đến server. Vui lòng kiểm tra API hoặc network.");
      setVehicle(null);
      setStep(1);
      onOpen();
    }
  };

  // --- Search ---
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

  // --- Step 2: Save thông tin mới ---
  const handleSave = () => {
    if (!newInfo.licensePlate || !newInfo.purchaseDate || !newInfo.owner) {
      setFormError("Vui lòng điền đầy đủ tất cả thông tin trước khi lưu.");
      return;
    }

    console.log("✅ Saved new info:", newInfo);

    if (vehicle) {
      setVehicle({
        ...vehicle,
        licensePlate: newInfo.licensePlate,
        purchaseDate: newInfo.purchaseDate,
        owner: newInfo.owner,
      });
    }

    setFormError("");
    onOpenChange();
  };

  return (
    <>
      <div className="w-full">
        <Input
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search by VIN or Customer ID..."
          startContent={
            <Search
              className="text-gray-400 w-5 h-5 ml-1 mr-2 cursor-pointer"
              onClick={triggerSearch}
            />
          }
          className="rounded-xl text-white"
          classNames={{
            inputWrapper: [
              "bg-gradient-to-br from-white/5 to-black/20",
              "backdrop-blur-xl",
              "border",
              "border-white/20",
              "hover:border-blue-400/60",
              "focus-within:!border-blue-400/80",
              "shadow-sm",
              "transition-all",
              "hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]",
              "focus-within:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
              "!outline-none",
              "!ring-0",
              "h-12",
              "rounded-xl",
            ],
            input: [
              "text-white",
              "placeholder:text-gray-400",
              "pl-1",
              "!outline-none",
            ],
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
        <ModalContent
          className="bg-gradient-to-br from-white/80 to-blue-100/60 backdrop-blur-3xl text-gray-800 p-8 rounded-2xl border border-blue-200/50 shadow-[0_8px_40px_rgba(59,130,246,0.2)] transition-all"
        >
          <ModalHeader className="text-3xl font-bold border-b border-blue-200/50 pb-4 text-center text-blue-700">
            {step === 1 ? "Vehicle Information" : "Enter Missing Information"}
          </ModalHeader>

          <ModalBody className="pt-8">
            {step === 1 && (
              <>
                {error ? (
                  <p className="text-center text-red-500 font-medium">{error}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      ["VIN", vehicle?.vin],
                      ["Model", vehicle?.model],
                      ["Company", vehicle?.company],
                      ["Date of Manufacture", vehicle?.dateOfManufacture],
                      ["Place of Manufacture", vehicle?.placeOfManufacture],
                      ["License Plate", vehicle?.licensePlate],
                      ["Purchase Date", vehicle?.purchaseDate],
                      ["Owner", vehicle?.owner],
                    ].map(([label, value], i) => (
                      <div
                        key={i}
                        className="bg-white/60 border border-blue-200/50 backdrop-blur-xl p-5 rounded-xl hover:border-blue-400 hover:shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all duration-200"
                      >
                        <p className="text-gray-500 text-sm font-medium">
                          {label}
                        </p>
                        <p className="font-semibold text-lg break-all text-blue-900">
                          {value ?? "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* phần nhập giữ nguyên */}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
