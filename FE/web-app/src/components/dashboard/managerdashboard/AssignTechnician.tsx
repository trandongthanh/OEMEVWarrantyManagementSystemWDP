"use client";

import { useState } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function AssignTechnician() {
  const [recordId, setRecordId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!recordId || !technicianId) {
      setResult("⚠️ Vui lòng nhập đầy đủ Vehicle processing record ID và Technician ID");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setResult("⚠️ Token không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/processing-records/${recordId}/assignment`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ technicianId }),
        }
      );

      const data = await response.json();
      console.log("📦 Swagger-style response:", data);

      if (response.ok && data.status === "success") {
        setResult("✅ Technician assigned successfully!");
      } else if (response.status === 404) {
        setResult("❌ Record not found hoặc Technician ID không tồn tại.");
      } else if (response.status === 401) {
        setResult("⚠️ Unauthorized — token hết hạn hoặc không hợp lệ.");
      } else if (response.status === 403) {
        setResult("🚫 Forbidden — bạn không có quyền gán technician.");
      } else if (response.status === 400) {
        setResult("⚠️ Bad Request — technician ID không hợp lệ.");
      } else {
        setResult(`❌ Lỗi không xác định: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("🚨 Fetch error:", error);
      setResult("⚠️ Không thể kết nối đến server. Kiểm tra lại API hoặc network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[450px] border border-gray-200 shadow-lg rounded-2xl">
        <CardHeader className="text-lg font-semibold text-gray-700">
          🚗 Assign Technician (Swagger UI Style)
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Vehicle processing record ID"
            placeholder="550e8400-e29b-41d4-a716-446655440000"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
          />
          <Input
            label="Technician ID"
            placeholder="550e8400-e29b-41d4-a716-446655440001"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
          />
          <Button
            color="primary"
            className="w-full"
            onPress={handleAssign}
            isLoading={loading}
          >
            Execute (PATCH)
          </Button>

          {result && (
            <p
              className={`text-center text-sm ${
                result.includes("✅")
                  ? "text-green-600"
                  : result.includes("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {result}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
