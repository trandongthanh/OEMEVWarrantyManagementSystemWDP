"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import apiClient from "@/lib/apiClient";

interface Role {
  roleId: string;
  roleName: string;
}
interface ServiceCenter {
  id: string;
  name: string;
}
interface VehicleCompany {
  id: string;
  name: string;
}
interface UserInfo {
  userId: string;
  username: string;
  roleName:
    | "emv_admin"
    | "service_center_manager"
    | "service_center_staff"
    | "service_center_technician"
    | "parts_coordinator_company"
    | "parts_coordinator_service_center";
  serviceCenterId?: string;
  companyId?: string;
}
interface FormData {
  username: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  name: string;
  employeeCode: string;
  roleId: string;
  serviceCenterId: string;
  vehicleCompanyId: string;
}

export function CreateUserAccount() {
  const currentUser = authService.getUserInfo() as UserInfo | null;
  const token = authService.getToken();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    name: "",
    employeeCode: "",
    roleId: "",
    serviceCenterId: "",
    vehicleCompanyId: "",
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [vehicleCompanies, setVehicleCompanies] = useState<VehicleCompany[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ===== Fetch Roles & Data =====
  useEffect(() => {
    if (!token || !currentUser) return;

    const fetchRoles = async () => {
      try {
        const res = await apiClient.get("/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedRoles: Role[] = res.data.data.map(
          (r: {
            roleId?: string;
            id?: string;
            roleName?: string;
            name?: string;
          }) => ({
            roleId: r.roleId || r.id || "",
            roleName: r.roleName || r.name || "",
          })
        );

        if (currentUser.roleName === "service_center_manager") {
          const allowed = [
            "service_center_staff",
            "service_center_technician",
            "parts_coordinator_service_center",
          ];
          setRoles(fetchedRoles.filter((r) => allowed.includes(r.roleName)));
        } else if (currentUser.roleName === "emv_admin") {
          setRoles(fetchedRoles);
        }
      } catch {
        toast.error("⚠️ Unable to load roles.");
      }
    };

    const fetchData = async () => {
      if (currentUser.roleName !== "emv_admin") return;
      try {
        const [scRes, vcRes] = await Promise.all([
          apiClient.get("/serviceCenters", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiClient.get("/vehicleCompanies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setServiceCenters(scRes.data.data || []);
        setVehicleCompanies(vcRes.data.data || []);
      } catch {
        toast.error("⚠️ Unable to load admin data.");
      }
    };

    fetchRoles();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ===== Handle Change =====
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (currentUser?.roleName === "emv_admin") {
      if (name === "serviceCenterId" && value) {
        setFormData((p) => ({
          ...p,
          serviceCenterId: value,
          vehicleCompanyId: "",
        }));
        return;
      }
      if (name === "vehicleCompanyId" && value) {
        setFormData((p) => ({
          ...p,
          vehicleCompanyId: value,
          serviceCenterId: "",
        }));
        return;
      }
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ===== Handle Submit =====
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const payload: {
        username: string;
        password: string;
        email?: string;
        phone?: string;
        address?: string;
        name?: string;
        employeeCode: string;
        roleId: string;
        serviceCenterId?: string;
        vehicleCompanyId?: string;
      } = {
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        name: formData.name || undefined,
        employeeCode: formData.employeeCode,
        roleId: formData.roleId,
      };

      if (currentUser.roleName === "service_center_manager") {
        payload.serviceCenterId = currentUser.serviceCenterId;
      }

      if (currentUser.roleName === "emv_admin") {
        const hasSC = !!formData.serviceCenterId;
        const hasVC = !!formData.vehicleCompanyId;
        if (hasSC && hasVC) {
          toast.error("⚠️ Select only one: Service Center or Vehicle Company.");
          setLoading(false);
          return;
        }
        if (!hasSC && !hasVC) {
          toast.error("⚠️ Please select Service Center or Vehicle Company.");
          setLoading(false);
          return;
        }
        if (hasSC) payload.serviceCenterId = formData.serviceCenterId;
        if (hasVC) payload.vehicleCompanyId = formData.vehicleCompanyId;
      }

      await apiClient.post("/auth/registerAccount", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Thành công
      toast.success("✅ Account created successfully!", { duration: 4000 });

      // Reset form
      setFormData({
        username: "",
        password: "",
        email: "",
        phone: "",
        address: "",
        name: "",
        employeeCode: "",
        roleId: "",
        serviceCenterId: "",
        vehicleCompanyId: "",
      });
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; errors?: string[] };
        };
      };
      console.error("❌ API Error:", error?.response?.data);

      const status = error?.response?.status;
      const errorMsg = error?.response?.data?.message?.toLowerCase?.() || "";
      const details = error?.response?.data?.errors;

      // ✅ Hiển thị chi tiết lỗi từ backend
      if (Array.isArray(details) && details.length > 0) {
        toast.error(`⚠️ ${details.join(", ")}`);
      } else if (errorMsg.includes("username")) {
        toast.error(
          "❌ Username already exists. Please choose another username."
        );
      } else if (errorMsg.includes("employeecode")) {
        toast.error(
          "❌ Employee Code already exists. Please use another code."
        );
      } else if (errorMsg.includes("validation")) {
        toast.error("⚠️ Validation error: Please check all required fields.");
      } else if (status === 409) {
        toast.error(
          `⚠️ Conflict: ${error.response?.data?.message || "Duplicate data."}`
        );
      } else if (status === 500) {
        toast.error(
          `❌ Server error: ${
            error.response?.data?.message ||
            "Something went wrong on the server."
          }`
        );
      } else {
        toast.error("❌ Unable to create account. Please check your input.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== UI Render =====
  if (!currentUser)
    return (
      <div className="p-6 text-center text-gray-600">
        ❌ You are not logged in
      </div>
    );

  if (!["emv_admin", "service_center_manager"].includes(currentUser.roleName))
    return (
      <div className="p-6 text-center text-gray-600">
        ❌ You do not have permission to create an account
      </div>
    );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Create User Account
          </h2>
          <p className="text-gray-600 mt-1">
            Manage employee accounts and assign roles for service centers or
            companies
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
            {/* User Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                User Information
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Username",
                    name: "username",
                    required: true,
                    type: "text",
                  },
                  {
                    label: "Password",
                    name: "password",
                    required: true,
                    type: "password",
                  },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone", type: "text" },
                  { label: "Full Name", name: "name", type: "text" },
                  { label: "Address", name: "address", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof FormData]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Code<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    name="employeeCode"
                    type="text"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Role Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Role & Assignment
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Role Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                      onFocus={() => setDropdownOpen(true)}
                      onBlur={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 appearance-none"
                    >
                      <option value="">Select role</option>
                      {roles.map((r) => (
                        <option key={r.roleId} value={r.roleId}>
                          {r.roleName}
                        </option>
                      ))}
                    </select>

                    {/* Animated arrow */}
                    <svg
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-300 text-gray-500 w-4 h-4 pointer-events-none ${
                        dropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Service Center / Vehicle Company (for admin only) */}
                {currentUser.roleName === "emv_admin" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Center
                      </label>
                      <select
                        name="serviceCenterId"
                        value={formData.serviceCenterId}
                        onChange={handleChange}
                        disabled={!!formData.vehicleCompanyId}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select service center</option>
                        {serviceCenters.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Company
                      </label>
                      <select
                        name="vehicleCompanyId"
                        value={formData.vehicleCompanyId}
                        onChange={handleChange}
                        disabled={!!formData.serviceCenterId}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select vehicle company</option>
                        {vehicleCompanies.map((vc) => (
                          <option key={vc.id} value={vc.id}>
                            {vc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
