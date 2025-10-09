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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const mockSearch = (vin: string) => {
    const found = mockData.find((v) => v.vin === vin);
    if (found) {
      setVehicle(found);
      setError(null);
    } else {
      setVehicle(null);
      setError("Không tìm thấy thông tin cho VIN này.");
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

      {/* Modal show result */}
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
            Vehicle Information
          </ModalHeader>
          <ModalBody className="pt-8">
            {error ? (
              <p className="text-center text-red-400 font-medium">{error}</p>
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
          </ModalBody>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-6">
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
                  onClick={() => console.log("Next clicked")}
                  className="
                    px-6 py-2 rounded-lg
                    bg-gradient-to-br from-blue-400 to-blue-600
                    text-white font-medium
                    hover:from-blue-300 hover:to-blue-400
                    hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]
                    transition-all
                  "
                >
                  Next
                </button>
              )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
