import apiClient from "@/lib/apiClient";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_URL = API_BASE_URL;

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerData {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface GetAllCustomersResponse {
  status: "success";
  data: {
    customers: Customer[];
  };
}

export interface UpdateCustomerResponse {
  status: "success";
  data: {
    customer: Customer;
  };
}

class CustomerService {
  /**
   * Search for customer by phone number or email
   */
  async searchCustomer(query: {
    phone?: string;
    email?: string;
  }): Promise<Customer | null> {
    try {
      const params = new URLSearchParams();
      if (query.phone) params.append("phone", query.phone);
      if (query.email) params.append("email", query.email);

      const response = await axios.get(
        `${API_URL}/customers?${params.toString()}`
      );

      if (response.data.status === "success" && response.data.data.customer) {
        return response.data.data.customer;
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error("Error searching customer:", error);
      throw error;
    }
  }

  /**
   * Get all customers (Manager only)
   * GET /customers/all
   */
  async getAllCustomers(): Promise<GetAllCustomersResponse> {
    try {
      const response = await apiClient.get("/customers/all");
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching all customers:", error);
      throw error;
    }
  }

  /**
   * Update customer information (Staff/Manager)
   * PATCH /customers/{id}
   */
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerData
  ): Promise<UpdateCustomerResponse> {
    try {
      const response = await apiClient.patch(`/customers/${customerId}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }
}

const customerService = new CustomerService();
export default customerService;
