"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Wrench } from "lucide-react";
import caseLineService, { CaseLine } from "@/services/caseLineService";
import { toast } from "sonner";
import { usePolling } from "@/hooks/usePolling";
import { MarkRepairCompleteButton } from "./MarkRepairCompleteButton";

export function RepairsToComplete() {
  const [caseLines, setCaseLines] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time polling for repairs to complete
  usePolling(
    async () => {
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
      });
      const inRepairLines = response.data?.caseLines || [];
      setCaseLines(inRepairLines);
      return inRepairLines;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading, // Only poll when not loading
      onError: (err) => {
        console.error("❌ Repairs polling error:", err);
      },
    }
  );

  useEffect(() => {
    fetchInRepairCaseLines();
  }, []);

  const fetchInRepairCaseLines = async () => {
    setLoading(true);
    try {
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
      });

      if (response.data?.caseLines) {
        const inRepairLines = response.data.caseLines;
        console.log("📋 Case lines in repair:", inRepairLines);
        setCaseLines(inRepairLines);
      }
    } catch (error) {
      console.error("Error fetching in-repair case lines:", error);
      toast.error("Failed to load repairs to complete");
    } finally {
      setLoading(false);
    }
  };

  const handleRepairSuccess = () => {
    fetchInRepairCaseLines(); // Refresh the list
    toast.success("Repair marked as complete!");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wrench className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Complete Repairs
            </h3>
            <p className="text-xs text-gray-500">
              Mark finished repairs as complete
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {caseLines.length}
        </span>
      </div>

      {caseLines.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No repairs pending completion</p>
          <p className="text-gray-400 text-xs mt-1">
            Case lines in IN_REPAIR status will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {caseLines.map((caseLine, index) => {
            const caseLineId = caseLine.id || caseLine.caseLineId || "";
            const pendingCount = caseLines.length - index - 1; // Remaining repairs after this one

            return (
              <motion.div
                key={caseLineId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {caseLine.typeComponent?.name || "Component"}
                    </h4>
                    <div className="space-y-0.5 text-xs text-gray-600">
                      {caseLine.diagnosisText && (
                        <p className="truncate">
                          <span className="font-medium">Diagnosis:</span>{" "}
                          {caseLine.diagnosisText}
                        </p>
                      )}
                      {caseLine.correctionText && (
                        <p className="truncate">
                          <span className="font-medium">Correction:</span>{" "}
                          {caseLine.correctionText}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Qty:</span>{" "}
                        {caseLine.quantity || 1}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Case:</span>{" "}
                        {caseLine.guaranteeCaseId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {caseLine.status} • Ready to mark complete
                      </p>
                    </div>
                  </div>

                  <MarkRepairCompleteButton
                    caseLineId={caseLineId}
                    showNextSteps={true}
                    pendingRepairsCount={pendingCount}
                    onSuccess={handleRepairSuccess}
                  />
                </div>

                {caseLine.warrantyStatus === "INELIGIBLE" && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-700">
                      <strong>Warranty Ineligible</strong>
                      {caseLine.rejectionReason && (
                        <p className="mt-0.5">{caseLine.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
