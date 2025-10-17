import api from "./api";

/**
 * 🔍 1. Tìm xe theo VIN
 * GET /vehicles/{vin}
 */
export const getVehicleByVin = async (vin) => {
  try {
    const res = await api.get(`/vehicles/${vin}`);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error fetching vehicle by VIN:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 👤 2. Đăng ký khách hàng làm chủ xe
 * PATCH /vehicles/{vin}
 */
export const registerVehicleOwner = async (vin, customerId, purchaseDate) => {
  try {
    const res = await api.patch(`/vehicles/${vin}`, {
      customer_id: customerId,
      purchase_date: purchaseDate,
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error registering vehicle owner:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 🧾 3. Lấy thông tin bảo hành chính thức của xe
 * GET /vehicles/{vin}/warranty
 */
export const getVehicleWarrantyInfo = async (vin, odometer) => {
  try {
    const res = await api.get(`/vehicles/${vin}/warranty`, {
      params: { odometer },
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error fetching vehicle warranty:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 🧮 4. Dự đoán bảo hành (preview) với ngày mua khác
 * POST /vehicles/{vin}/warranty/preview
 */
export const previewVehicleWarranty = async (vin, purchaseDate) => {
  try {
    const res = await api.post(`/vehicles/${vin}/warranty/preview`, {
      purchase_date: purchaseDate,
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error previewing warranty:",
      error.response?.data || error.message
    );
    throw error;
  }
};
