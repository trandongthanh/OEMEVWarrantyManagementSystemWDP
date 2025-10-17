"use client";

import { useState } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function AssignTechnicianDashboard() {
  const [recordId, setRecordId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showAssignCard, setShowAssignCard] = useState(false);

  // Handle Create New Record
  const handleCreate = () => {
    if (!recordId || !technicianId) {
      alert("⚠️ Please fill in both Record ID and Technician ID");
      return;
    }
    setShowAssignCard(true);
  };

  // Handle Assign Technician
  const handleAssign = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setResult("⚠️ Token not found. Please log in again.");
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
          body: JSON.stringify({ technicianId, note }),
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setResult("✅ Technician assigned successfully!");
      } else {
        setResult(`❌ Error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      setResult("⚠️ Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Create New Record Card */}
        {!showAssignCard && (
          <Card className="border border-gray-200 shadow-2xl rounded-3xl bg-white overflow-hidden">
            <CardHeader className="text-3xl font-bold text-gray-800 flex items-center gap-3 bg-blue-50 px-8 py-6 rounded-t-3xl shadow-inner">
              🆕 Create New Vehicle Record
            </CardHeader>
            <CardBody className="space-y-6 px-8 py-8">
              {/* Page Description */}
              <p className="text-gray-600 text-sm mb-4">
                Use this form to create a new vehicle processing record and assign a technician. You can optionally add a note.
              </p>

              <Input
                type="text"
                label=""
                placeholder="Vehicle Processing Record ID"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Input
                type="text"
                label=""
                placeholder="Technician ID"
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Input
                type="text"
                label=""
                placeholder="Note / Comment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Button
                className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors rounded-xl py-3 shadow-md shadow-green-200 hover:shadow-lg"
                onPress={handleCreate}
              >
                Create Record
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Assign Technician Card */}
        {showAssignCard && (
          <Card className="border border-gray-200 shadow-2xl rounded-3xl bg-white overflow-hidden">
            <CardHeader className="text-3xl font-bold text-gray-800 flex items-center gap-3 bg-blue-50 px-8 py-6 rounded-t-3xl shadow-inner">
              🚗 Assign Technician
            </CardHeader>
            <CardBody className="space-y-6 px-8 py-8">
              {/* Page Description */}
              <p className="text-gray-600 text-sm mb-4">
                Use this form to assign a technician to the vehicle processing record. You can add optional notes for reference.
              </p>

              <Input
                type="text"
                label=""
                placeholder="Vehicle Processing Record ID"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Input
                type="text"
                label=""
                placeholder="Technician ID"
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Input
                type="text"
                label=""
                placeholder="Note / Comment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                radius="lg"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg transition-all py-3 px-4",
                  input: "text-gray-900 placeholder-gray-400 font-medium",
                  label: "hidden",
                }}
              />

              <Button
                className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-xl py-3 shadow-md shadow-blue-200 hover:shadow-lg"
                onPress={handleAssign}
                isLoading={loading}
              >
                Execute Assignment
              </Button>

              {result && (
                <p
                  className={`text-center text-sm font-medium ${
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
        )}
      </div>
    </div>
  );
}
