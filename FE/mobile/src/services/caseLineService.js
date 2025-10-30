// ✅ Dùng chung axios instance đã cấu hình sẵn
import api from "./api";

/**
 * 🧩 1️⃣ Tạo case lines cho một Guarantee Case (Technician)
 * POST /guarantee-cases/{caseId}/case-lines
 */
export const createCaseLines = async (caseId, caseLines) => {
  try {
    const res = await api.post(`/guarantee-cases/${caseId}/case-lines`, {
      caseLines,
    });
    return res.data; // { status: "success", data: { caseLines: [...] } }
  } catch (error) {
    console.error(
      "❌ Error creating case lines:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * ⚙️ 2️⃣ Approve / Reject các Case Lines (Service Center Staff)
 * PATCH /case-lines/approve
 */
export const approveOrRejectCaseLines = async (
  approvedIds = [],
  rejectedIds = []
) => {
  try {
    const body = {
      approvedCaseLineIds: approvedIds,
      rejectedCaseLineIds: rejectedIds,
    };
    const res = await api.patch("/case-lines/approve", body);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error approving/rejecting case lines:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 🔍 3️⃣ Lấy danh sách Case Lines theo Guarantee Case ID (tuỳ chọn)
 * GET /case-lines?guaranteeCaseId={id}
 */
export const getCaseLinesByCaseId = async (caseId) => {
  try {
    const res = await api.get("/case-lines", {
      params: { guaranteeCaseId: caseId },
    });
    return res.data; // { status: "success", data: { caseLines: [...] } }
  } catch (error) {
    console.error(
      "❌ Error fetching case lines:",
      error.response?.data || error.message
    );
    throw error;
  }
};
