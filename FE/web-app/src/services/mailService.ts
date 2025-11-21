import apiClient from "@/lib/apiClient";

/**
 * Mail Service
 *
 * Handles OTP email verification for sensitive operations
 * like creating records and approving case lines
 */

// ==================== Types ====================

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  status: "success";
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  status: "success";
  message: string;
}

// ==================== Mail/OTP API ====================

/**
 * Send OTP to email
 * POST /mail/otp/send
 *
 * Sends a 6-digit OTP code to the specified email.
 * OTP is valid for 5 minutes.
 */
export async function sendOtp(
  email: string,
  vin?: string
): Promise<SendOtpResponse> {
  try {
    const payload: { email: string; vin?: string } = { email };
    if (vin) {
      payload.vin = vin;
    }
    console.log("Sending OTP with payload:", payload);

    const response = await apiClient.post<SendOtpResponse>(
      "/mail/otp/send",
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

/**
 * Verify OTP code
 * POST /mail/otp/verify
 *
 * Verifies the OTP code sent to email.
 * On success, creates a verification flag valid for 10 minutes
 * to allow subsequent sensitive operations.
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResponse> {
  try {
    const response = await apiClient.post<VerifyOtpResponse>(
      "/mail/otp/verify",
      { email, otp }
    );

    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

const mailService = {
  sendOtp,
  verifyOtp,
};

export default mailService;
