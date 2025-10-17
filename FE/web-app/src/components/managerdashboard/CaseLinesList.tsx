"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader, FileText, Calendar, User } from "lucide-react";
import managerService, {
  type ProcessingRecord,
} from "@/services/managerService";

interface CaseLineType {
  caseLineId: string;
  guaranteeCaseId: string;
  diagnosisText: string;
  correctionText: string;
  componentId: string | null;
  quantity: number;
  warrantyStatus: "ELIGIBLE" | "INELIGIBLE";
  component?: {
    name: string;
    partNumber: string;
  };
}

interface CaseLineWithGuaranteeCase {
  guaranteeCase: {
    caseId: string;
    caseLines: CaseLineType[];
  };
}

interface CaseLinesListProps {
  recordId: string;
}

export function CaseLinesList({ recordId }: CaseLinesListProps) {
  const [record, setRecord] = useState<ProcessingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecordDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  const loadRecordDetails = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await managerService.getProcessingRecordDetails(
        recordId
      );
      setRecord(response.data.records.records[0]);
    } catch (err: unknown) {
      setError("Failed to load case details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Record Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">VIN</p>
            <p className="font-semibold text-gray-900">{record.vin}</p>
          </div>
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Check-in Date
            </p>
            <p className="font-semibold text-gray-900">
              {new Date(record.checkInDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Odometer</p>
            <p className="font-semibold text-gray-900">
              {record.odometer.toLocaleString()} km
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold text-gray-900">
              {record.status.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {record.mainTechnician && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 flex items-center gap-1 text-sm">
              <User className="w-3 h-3" />
              Assigned Technician
            </p>
            <p className="font-semibold text-gray-900">
              {record.mainTechnician.name}
            </p>
          </div>
        )}
      </div>

      {/* Guarantee Cases */}
      {record.guaranteeCases && record.guaranteeCases.length > 0 ? (
        <div className="space-y-4">
          {record.guaranteeCases.map((guaranteeCase, index) => (
            <motion.div
              key={guaranteeCase.guaranteeCaseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-gray-700 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Guarantee Case #{index + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {guaranteeCase.contentGuarantee}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {guaranteeCase.guaranteeCaseId}
                  </p>
                </div>
              </div>

              {/* Case Lines would be loaded separately via API */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 italic">
                  Case lines details would be loaded from the case lines API
                  endpoint
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No guarantee cases found</p>
          </div>
        </div>
      )}
    </div>
  );
}
