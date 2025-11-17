// otpService.js
import api from "./api";

const otpService = {
  // ===============================
  // Gửi OTP
  // ===============================
  sendOtp: async (email, vin) => {
    try {
      const res = await api.post("/mail/otp/send", {
        email,
        vin, // ⭐ MUST HAVE
      });
      return res.data;
    } catch (error) {
      console.log("❌ OTP SEND ERROR FULL:", error.response?.data || error);
      throw error;
    }
  },

  // ===============================
  // Verify OTP
  // ===============================
  verifyOtp: async (email, otp, vin) => {
    try {
      const res = await api.post("/mail/otp/verify", {
        email,
        otp,
        vin, // ⭐ MUST HAVE
      });
      return res.data;
    } catch (error) {
      console.log("❌ OTP VERIFY ERROR FULL:", error.response?.data || error);
      throw error;
    }
  },
};

export default otpService;
