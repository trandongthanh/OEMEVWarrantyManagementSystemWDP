"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowRight,
} from "lucide-react";
import { vehicleService, customerService } from "@/services";

interface RegisterVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onCreateClaim?: () => void;
  initialVin?: string;
}

export function RegisterVehicleModal({
  isOpen,
  onClose,
  onSuccess,
  onCreateClaim,
  initialVin,
}: RegisterVehicleModalProps) {
  const [step, setStep] = useState<
    "searchVehicle" | "searchCustomer" | "register" | "success"
  >("searchVehicle");
  const [vin, setVin] = useState("");
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);

  // Vehicle additional info
  const [dateOfManufacture, setDateOfManufacture] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  // New customer info
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setStep("searchVehicle");
    setVin("");
    setVehicleData(null);
    setCustomerSearch("");
    setCustomerData(null);
    setUseExistingCustomer(true);
    setDateOfManufacture("");
    setLicensePlate("");
    setPurchaseDate("");
    setNewCustomer({ fullName: "", email: "", phone: "", address: "" });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-fill VIN and search when initialVin is provided
  useEffect(() => {
    if (isOpen && initialVin) {
      setVin(initialVin);
      setError("");
      // Auto-search the vehicle after a short delay to ensure modal is open
      const timer = setTimeout(async () => {
        if (!initialVin.trim()) return;

        setIsLoading(true);
        try {
          const response = await vehicleService.findVehicleByVin(
            initialVin.trim()
          );
          if (response.data?.vehicle) {
            const vehicle = response.data.vehicle;
            setVehicleData(vehicle);

            if (vehicle.dateOfManufacture) {
              setDateOfManufacture(
                new Date(vehicle.dateOfManufacture).toISOString().split("T")[0]
              );
            }
            if (vehicle.licensePlate) {
              setLicensePlate(vehicle.licensePlate);
            }
            if (vehicle.purchaseDate) {
              setPurchaseDate(
                new Date(vehicle.purchaseDate).toISOString().split("T")[0]
              );
            }

            // Check if vehicle already has an owner
            if (vehicle.owner) {
              setError(
                "This vehicle already has a registered owner. Cannot register again."
              );
            } else {
              setStep("searchCustomer");
            }
          }
        } catch (err: any) {
          setError(err.response?.data?.message || "Vehicle not found");
        } finally {
          setIsLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialVin]);

  const handleSearchVehicle = async () => {
    if (!vin.trim()) {
      setError("Please enter a VIN");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await vehicleService.findVehicleByVin(vin.trim());

      if (response.data?.vehicle) {
        const vehicle = response.data.vehicle;
        setVehicleData(vehicle);

        // Pre-fill data if available
        if (vehicle.dateOfManufacture) {
          setDateOfManufacture(
            new Date(vehicle.dateOfManufacture).toISOString().split("T")[0]
          );
        }
        if (vehicle.licensePlate) {
          setLicensePlate(vehicle.licensePlate);
        }
        if (vehicle.purchaseDate) {
          setPurchaseDate(
            new Date(vehicle.purchaseDate).toISOString().split("T")[0]
          );
        }

        // Check if vehicle already has owner
        if (vehicle.owner || vehicle.ownerId) {
          setError(
            "This vehicle already has an owner registered. Cannot register again."
          );
          return;
        }

        setStep("searchCustomer");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Vehicle not found. Please check the VIN."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCustomer = async () => {
    if (!customerSearch.trim()) {
      setError("Please enter email or phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isEmail = customerSearch.includes("@");
      const customer = await customerService.searchCustomer(
        isEmail ? { email: customerSearch } : { phone: customerSearch }
      );

      if (customer) {
        setCustomerData(customer);
        setUseExistingCustomer(true);
        setStep("register");
      } else {
        setError("Customer not found. You can create a new customer below.");
        setUseExistingCustomer(false);
        // Pre-fill email or phone
        if (isEmail) {
          setNewCustomer((prev) => ({ ...prev, email: customerSearch }));
        } else {
          setNewCustomer((prev) => ({ ...prev, phone: customerSearch }));
        }
      }
    } catch (err) {
      setError("Customer not found. You can create a new customer below.");
      setUseExistingCustomer(false);
      const isEmail = customerSearch.includes("@");
      if (isEmail) {
        setNewCustomer((prev) => ({ ...prev, email: customerSearch }));
      } else {
        setNewCustomer((prev) => ({ ...prev, phone: customerSearch }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterVehicle = async () => {
    // Validation
    if (!dateOfManufacture || !licensePlate || !purchaseDate) {
      setError("Please fill in all vehicle information");
      return;
    }

    if (!useExistingCustomer) {
      if (!newCustomer.fullName || !newCustomer.email || !newCustomer.phone) {
        setError("Please fill in all required customer information");
        return;
      }
    } else {
      if (!customerData) {
        setError("Please search and select an existing customer");
        return;
      }
    }

    setIsLoading(true);
    setError("");

    try {
      const payload: any = {
        dateOfManufacture: new Date(dateOfManufacture).toISOString(),
        licensePlate: licensePlate,
        purchaseDate: new Date(purchaseDate).toISOString(),
      };

      if (useExistingCustomer && customerData) {
        console.log("customerData:", customerData);
        console.log("customerData.id:", customerData.id);
        payload.customerId = customerData.id;
      } else {
        payload.customer = {
          fullName: newCustomer.fullName,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address || undefined,
        };
      }

      console.log("Registering vehicle with payload:", payload);
      console.log(
        "useExistingCustomer:",
        useExistingCustomer,
        "customerData:",
        customerData
      );

      await vehicleService.registerVehicleOwner(vin, payload);
      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to register vehicle. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Register Vehicle
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {step === "searchVehicle" && "Step 1: Search for Vehicle"}
                    {step === "searchCustomer" && "Step 2: Find Customer"}
                    {step === "register" && "Step 3: Complete Registration"}
                    {step === "success" && "Registration Successful!"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 1: Search Vehicle */}
                {step === "searchVehicle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Identification Number (VIN) *
                      </label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={vin}
                          onChange={(e) => setVin(e.target.value.toUpperCase())}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSearchVehicle()
                          }
                          placeholder="Enter VIN (e.g., VIN-NEW-0)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the vehicle's VIN to check registration status
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Search Customer */}
                {step === "searchCustomer" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Vehicle Info Display */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-5 h-5 text-blue-600" />
                        <p className="font-semibold text-blue-900">
                          Vehicle Found
                        </p>
                      </div>
                      <p className="text-sm text-blue-700">
                        VIN: {vehicleData?.vin}
                      </p>
                      {vehicleData?.vehicleModel && (
                        <p className="text-sm text-blue-700">
                          Model: {vehicleData.vehicleModel.modelName}
                        </p>
                      )}
                    </div>

                    {/* Customer Search */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Customer by Email or Phone *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                              setCustomerSearch(e.target.value);
                              if (error) setError(""); // Clear error when typing
                            }}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSearchCustomer()
                            }
                            placeholder="Enter email or phone number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                          />
                        </div>
                        <button
                          onClick={handleSearchCustomer}
                          disabled={isLoading || !customerSearch.trim()}
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Search className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Search for existing customer or create new one
                      </p>
                    </div>

                    {/* Customer Not Found - Enhanced UI */}
                    {error && error.includes("not found") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              Customer Not Found
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            </h4>
                            <p className="text-sm text-gray-700 mb-4">
                              No customer found with{" "}
                              <span className="font-medium text-amber-700">
                                {customerSearch}
                              </span>
                              . Would you like to create a new customer record?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => {
                                  setStep("register");
                                  setError("");
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg"
                              >
                                <User className="w-4 h-4" />
                                Create New Customer
                              </button>
                              <button
                                onClick={() => {
                                  setCustomerSearch("");
                                  setError("");
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
                              >
                                <Search className="w-4 h-4" />
                                Search Again
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Generic Error */}
                    {error && !error.includes("not found") && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Register */}
                {step === "register" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Vehicle Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Vehicle Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Manufacture *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="date"
                              value={dateOfManufacture}
                              onChange={(e) =>
                                setDateOfManufacture(e.target.value)
                              }
                              readOnly
                              aria-readonly
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            License Plate *
                          </label>
                          <input
                            type="text"
                            value={licensePlate}
                            onChange={(e) =>
                              setLicensePlate(e.target.value.toUpperCase())
                            }
                            placeholder="e.g., 51F-987.65"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Date *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="date"
                              value={purchaseDate}
                              onChange={(e) => setPurchaseDate(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </h3>

                      {useExistingCustomer && customerData ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-green-900">
                              Existing Customer
                            </p>
                          </div>
                          <div className="space-y-1 text-sm text-green-700">
                            <p>
                              <strong>Name:</strong> {customerData.fullName}
                            </p>
                            <p>
                              <strong>Email:</strong> {customerData.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {customerData.phone}
                            </p>
                            {customerData.address && (
                              <p>
                                <strong>Address:</strong> {customerData.address}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                              Creating new customer record
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="text"
                                  value={newCustomer.fullName}
                                  onChange={(e) =>
                                    setNewCustomer({
                                      ...newCustomer,
                                      fullName: e.target.value,
                                    })
                                  }
                                  placeholder="Enter full name"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="email"
                                  value={newCustomer.email}
                                  onChange={(e) =>
                                    setNewCustomer({
                                      ...newCustomer,
                                      email: e.target.value,
                                    })
                                  }
                                  placeholder="email@example.com"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone *
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="tel"
                                  value={newCustomer.phone}
                                  onChange={(e) =>
                                    setNewCustomer({
                                      ...newCustomer,
                                      phone: e.target.value,
                                    })
                                  }
                                  placeholder="Phone number"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                                />
                              </div>
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address (Optional)
                              </label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                  value={newCustomer.address}
                                  onChange={(e) =>
                                    setNewCustomer({
                                      ...newCustomer,
                                      address: e.target.value,
                                    })
                                  }
                                  placeholder="Enter address"
                                  rows={2}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white resize-none transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Vehicle Registered Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      The vehicle has been registered to the customer.
                    </p>

                    {/* Suggestion to create claim */}
                    {onCreateClaim && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">
                          Would you like to create a warranty claim for this
                          vehicle?
                        </p>
                        <button
                          onClick={() => {
                            handleClose();
                            onCreateClaim();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Create New Claim
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {step !== "success" && (
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={
                      step === "searchVehicle"
                        ? handleClose
                        : step === "searchCustomer"
                        ? () => setStep("searchVehicle")
                        : () => setStep("searchCustomer")
                    }
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    {step === "searchVehicle" ? "Cancel" : "Back"}
                  </button>

                  {/* Hide Continue button when customer not found card is shown */}
                  {!(
                    step === "searchCustomer" && error.includes("not found")
                  ) && (
                    <button
                      onClick={
                        step === "searchVehicle"
                          ? handleSearchVehicle
                          : step === "searchCustomer"
                          ? handleSearchCustomer
                          : handleRegisterVehicle
                      }
                      disabled={
                        isLoading ||
                        (step === "searchCustomer" && !customerSearch.trim())
                      }
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {step === "register"
                            ? "Register Vehicle"
                            : "Continue"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
