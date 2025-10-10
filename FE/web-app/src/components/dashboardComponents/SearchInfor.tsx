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

// Mock data
const mockData: Vehicle[] = [
  {
    vin: "5YJ3E1EA7KF317000",
    dateOfManufacture: "2023-02-20T01:36:07.000Z",
    placeOfManufacture: "Lake Christ",
    licensePlate: "30A-12345",
    purchaseDate: "2023-05-01",
    owner: "Nguyen Van A",
    model: "Model 3",
    company: "Tesla",
  },
  {
    vin: "JTESB3BR2JDJ93833",
    dateOfManufacture: "2022-11-10T08:20:00.000Z",
    placeOfManufacture: "Tokyo",
    licensePlate: null,
    purchaseDate: null,
    owner: null,
    model: "Land Cruiser",
    company: "Toyota",
  },
  {
    vin: "WDBUF56X88B312345",
    dateOfManufacture: "2021-07-15T09:00:00.000Z",
    placeOfManufacture: "Berlin",
    licensePlate: "29B-99876",
    purchaseDate: "2021-09-05",
    owner: "Tran Thi B",
    model: "E-Class",
    company: "Mercedes-Benz",
  },
];

export default function SearchInfor() {
  const [value, setValue] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Dữ liệu nhập thêm
  const [newInfo, setNewInfo] = useState({
    licensePlate: "",
    purchaseDate: "",
    owner: "",
  });
  const [formError, setFormError] = useState("");

  // --- Search ---
  const mockSearch = (vin: string) => {
    const found = mockData.find((v) => v.vin === vin);
    if (found) {
      setVehicle(found);
      setError(null);
      setStep(1);
    } else {
      setVehicle(null);
      setError("Không tìm thấy thông tin cho VIN này.");
      setStep(1);
    }
    onOpen();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (newValue.length > 17) newValue = newValue.slice(0, 17);
    setValue(newValue);
  };

  const triggerSearch = () => {
    if (value.length === 17) {
      mockSearch(value);
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

    // Giả lập cập nhật dữ liệu cho vehicle
    if (vehicle) {
      setVehicle({
        ...vehicle,
        licensePlate: newInfo.licensePlate,
        purchaseDate: newInfo.purchaseDate,
        owner: newInfo.owner,
      });
    }

    setFormError("");
    onOpenChange(); // đóng modal
  };

  return (
    <>
      {/* Search bar */}
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

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        backdrop="blur"
        placement="center"
      >
        <ModalContent
          className="
            bg-gradient-to-br from-white/10 to-black/40
            backdrop-blur-2xl
            text-white
            p-8
            rounded-2xl
            border border-white/20
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          "
        >
          <ModalHeader className="text-3xl font-bold border-b border-white/10 pb-4 text-center">
            {step === 1 ? "Vehicle Information" : "Enter Missing Information"}
          </ModalHeader>

          <ModalBody className="pt-8">
            {/* STEP 1 */}
            {step === 1 && (
              <>
                {error ? (
                  <p className="text-center text-red-400 font-medium">
                    {error}
                  </p>
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
                        className="
                          bg-gradient-to-br from-white/5 to-black/20
                          border border-white/10
                          backdrop-blur-xl
                          p-5 rounded-xl
                          hover:border-blue-400/50
                          hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]
                          transition-all duration-200
                        "
                      >
                        <p className="text-gray-400 text-sm">{label}</p>
                        <p className="font-semibold text-lg break-all text-white">
                          {value ?? "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Vehicle Information Section */}
                <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-visible">
                  {/* Header */}
                  <div className="bg-green-500/20 px-4 py-2 rounded-t-2xl border-b border-white/5">
                    <p className="font-semibold text-green-300 text-lg">
                      Missing Information
                    </p>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
                    {/* License Plate */}
                    <Input
                      placeholder="License Plate (e.g., 30A-99999)"
                      value={newInfo.licensePlate}
                      onChange={(e) =>
                        setNewInfo({ ...newInfo, licensePlate: e.target.value })
                      }
                      classNames={{
                        inputWrapper:
                          "bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none hover:border-green-400/60 focus-within:border-green-400/80 h-12",
                        input:
                          "text-white font-medium !outline-none placeholder:text-gray-400",
                      }}
                    />

                    {/* Purchase Date */}
                    <Input
                      type="date"
                      placeholder="Purchase Date"
                      value={newInfo.purchaseDate}
                      onChange={(e) =>
                        setNewInfo({ ...newInfo, purchaseDate: e.target.value })
                      }
                      classNames={{
                        inputWrapper:
                          "bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none hover:border-green-400/60 focus-within:border-green-400/80 h-12",
                        input:
                          "text-white font-medium !outline-none placeholder:text-gray-400 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70",
                      }}
                    />

                    {/* Owner */}
                    <Input
                      placeholder="Owner (e.g., Nguyen Van B)"
                      value={newInfo.owner}
                      onChange={(e) =>
                        setNewInfo({ ...newInfo, owner: e.target.value })
                      }
                      classNames={{
                        inputWrapper:
                          "bg-slate-900/40 backdrop-blur-sm placeholder-white/60 rounded-lg border border-white/10 transition-all !shadow-none !outline-none hover:border-green-400/60 focus-within:border-green-400/80 h-12",
                        input:
                          "text-white font-medium !outline-none placeholder:text-gray-400",
                      }}
                    />
                  </div>
                </div>

                {/* Error message */}
                {formError && (
                  <p className="text-red-400 text-center mt-2 font-medium">
                    {formError}
                  </p>
                )}
              </div>
            )}
          </ModalBody>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-6">
            {step === 1 ? (
              <>
                <button
                  onClick={onOpenChange}
                  className="
                    px-6 py-2 rounded-lg
                    bg-gradient-to-br from-white/5 to-black/30
                    border border-white/20
                    text-gray-300
                    hover:border-blue-400/60
                    hover:shadow-[0_0_10px_rgba(59,130,246,0.25)]
                    transition-all
                  "
                >
                  Cancel
                </button>

                {vehicle &&
                  !vehicle.licensePlate &&
                  !vehicle.purchaseDate &&
                  !vehicle.owner && (
                    <button
                      onClick={() => setStep(2)}
                      className="
                     px-6 py-2 rounded-lg
                     bg-gradient-to-br from-green-400 to-green-600
                     text-white font-medium
                     hover:from-green-300 hover:to-green-400
                     hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]
                     transition-all
                      "
                    >
                      Next
                    </button>
                  )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="
                    px-6 py-2 rounded-lg
                    bg-gradient-to-br from-white/5 to-black/30
                    border border-white/20
                    text-gray-300
                    hover:border-blue-400/60
                    hover:shadow-[0_0_10px_rgba(59,130,246,0.25)]
                    transition-all
                  "
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="
                    px-6 py-2 rounded-lg
                    bg-gradient-to-br from-green-400 to-green-600
                    text-white font-medium
                    hover:from-green-300 hover:to-green-400
                    hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]
                    transition-all
                  "
                >
                  Save
                </button>
              </>
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
