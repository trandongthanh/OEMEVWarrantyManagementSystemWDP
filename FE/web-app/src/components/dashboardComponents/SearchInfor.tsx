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
      <div className="flex justify-center w-full mt-6">
        <div className="flex-1 max-w-md">
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
      bg-gradient-to-br from-white/80 to-blue-100/60
      backdrop-blur-3xl
      text-gray-800
      p-8
      rounded-2xl
      border border-blue-200/50
      shadow-[0_8px_40px_rgba(59,130,246,0.2)]
      transition-all
    "
        >
          <ModalHeader className="text-3xl font-bold border-b border-blue-200/50 pb-4 text-center text-blue-700">
            {step === 1 ? "Vehicle Information" : "Enter Missing Information"}
          </ModalHeader>

          <ModalBody className="pt-8">
            {/* STEP 1 */}
            {step === 1 && (
              <>
                {error ? (
                  <p className="text-center text-red-500 font-medium">
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
                    bg-white/60
                    border border-blue-200/50
                    backdrop-blur-xl
                    p-5 rounded-xl
                    hover:border-blue-400
                    hover:shadow-[0_0_16px_rgba(59,130,246,0.25)]
                    transition-all duration-200
                  "
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

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-xl border border-blue-200/50 rounded-2xl shadow-md overflow-visible">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-t-2xl border-b border-blue-200/50">
                    <p className="font-semibold text-blue-700 text-lg">
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
                        inputWrapper: `
              bg-white/60 backdrop-blur-md rounded-lg border-none
              shadow-inner transition-all duration-200
              hover:shadow-[0_0_8px_rgba(59,130,246,0.25)]
              focus-within:shadow-[0_0_10px_rgba(59,130,246,0.4)]
              h-12
              !outline-none !ring-0
            `,
                        input: `
              text-gray-800 font-medium placeholder:text-gray-400
              !outline-none !ring-0 focus:!outline-none focus:!ring-0
            `,
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
                        inputWrapper: `
              bg-white/60 backdrop-blur-md rounded-lg border-none
              shadow-inner transition-all duration-200
              hover:shadow-[0_0_8px_rgba(59,130,246,0.25)]
              focus-within:shadow-[0_0_10px_rgba(59,130,246,0.4)]
              h-12
              !outline-none !ring-0
            `,
                        input: `
              text-gray-800 font-medium placeholder:text-gray-400
              [&::-webkit-calendar-picker-indicator]:opacity-80
              !outline-none !ring-0 focus:!outline-none focus:!ring-0
            `,
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
                        inputWrapper: `
              bg-white/60 backdrop-blur-md rounded-lg border-none
              shadow-inner transition-all duration-200
              hover:shadow-[0_0_8px_rgba(59,130,246,0.25)]
              focus-within:shadow-[0_0_10px_rgba(59,130,246,0.4)]
              h-12
              !outline-none !ring-0
            `,
                        input: `
              text-gray-800 font-medium placeholder:text-gray-400
              !outline-none !ring-0 focus:!outline-none focus:!ring-0
            `,
                      }}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-red-500 text-center mt-2 font-medium">
                    {formError}
                  </p>
                )}
              </div>
            )}
          </ModalBody>

          {/* FOOTER */}
          <div className="flex justify-end gap-4 pt-6 border-t border-blue-200/50 mt-6">
            {step === 1 ? (
              <>
                <button
                  onClick={onOpenChange}
                  className="
              px-6 py-2 rounded-lg
              bg-white/60
              border border-blue-200/60
              text-blue-700 font-medium
              hover:bg-blue-50
              hover:border-blue-400
              hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]
              transition-all
            "
                >
                  Cancel
                </button>

                {vehicle &&
                  (!vehicle.licensePlate ||
                    !vehicle.purchaseDate ||
                    !vehicle.owner) && (
                    <button
                      onClick={() => setStep(2)}
                      className="
                  px-6 py-2 rounded-lg
                  bg-gradient-to-br from-blue-500 to-blue-600
                  text-white font-medium
                  hover:from-blue-400 hover:to-blue-500
                  hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]
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
              bg-white/60
              border border-blue-200/60
              text-blue-700 font-medium
              hover:bg-blue-50
              hover:border-blue-400
              hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]
              transition-all
            "
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="
              px-6 py-2 rounded-lg
              bg-gradient-to-br from-green-400 to-green-500
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
