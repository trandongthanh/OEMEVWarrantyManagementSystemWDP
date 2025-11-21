"use client";

import { useEffect, useState } from "react";
import recallService, { RecallCampaign } from "@/services/recallService";
import {
  Loader2,
  Plus,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Rocket,
  Filter,
  AlertCircle,
} from "lucide-react";

// Status Badge Component
function StatusBadge({
  status,
}: {
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}) {
  const statusConfig = {
    DRAFT: {
      icon: FileText,
      color: "bg-gray-100 text-gray-700",
      label: "Draft",
    },
    ACTIVE: {
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
      label: "Active",
    },
    COMPLETED: {
      icon: CheckCircle2,
      color: "bg-blue-100 text-blue-700",
      label: "Completed",
    },
    CANCELLED: {
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

interface CreateRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRecallModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRecallModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modelIds, setModelIds] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    } else {
      setName("");
      setDescription("");
      setIssueDate("");
      setStartDate("");
      setEndDate("");
      setModelIds("");
      setSelectedModelIds([]);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const loadAvailableModels = async () => {
    try {
      setLoadingModels(true);
      // Get all campaigns to extract unique vehicle models
      const result = await recallService.getRecallCampaigns({
        page: 1,
        limit: 100,
      });
      const uniqueModels = new Map<string, string>();
      result.campaigns.forEach((campaign) => {
        campaign.affectedVehicleModels?.forEach((model) => {
          uniqueModels.set(model.vehicleModelId, model.vehicleModelName);
        });
      });
      setAvailableModels(
        Array.from(uniqueModels, ([id, name]) => ({ id, name }))
      );
    } catch (err) {
      console.error("Error loading models:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  const validate = () => {
    if (!name.trim()) return "Campaign name is required.";
    if (!description.trim()) return "Description is required.";
    if (!issueDate) return "Issue date is required.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (new Date(endDate) < new Date(startDate)) {
      return "End date must be after start date.";
    }
    if (selectedModelIds.length === 0 && !modelIds.trim()) {
      return "Select at least one vehicle model or enter model IDs.";
    }
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Use selected models or fall back to manual entry
      let affectedVehicleModelIds = selectedModelIds;
      if (affectedVehicleModelIds.length === 0 && modelIds.trim()) {
        affectedVehicleModelIds = modelIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
      }

      await recallService.createRecallCampaign({
        name: name.trim(),
        description: description.trim(),
        issueDate,
        affectedVehicleModelIds,
      });

      setSuccessMessage(
        `Recall campaign created successfully! Active from ${new Date(
          startDate
        ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating recall campaign:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message || "Failed to create recall campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Create Recall Campaign
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new vehicle recall campaign for affected models
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Campaign Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Campaign Name *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Battery Recall Q1 2025"
            />
          </div>

          {/* Date Fields Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                Issue Date *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                Start Date *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={issueDate}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                End Date *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Description *
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the recall issue and resolution..."
              rows={4}
            />
          </div>

          {/* Affected Vehicle Models Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Affected Vehicle Models *
            </label>
            {loadingModels ? (
              <div className="flex items-center justify-center py-8 border border-gray-200 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  Loading models...
                </span>
              </div>
            ) : availableModels.length > 0 ? (
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <label
                      key={model.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModelIds.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModelIds([
                              ...selectedModelIds,
                              model.id,
                            ]);
                          } else {
                            setSelectedModelIds(
                              selectedModelIds.filter((id) => id !== model.id)
                            );
                          }
                        }}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-900">
                        {model.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        ({model.id.slice(0, 8)}...)
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  No vehicle models found in existing campaigns. Enter model IDs
                  manually below:
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  value={modelIds}
                  onChange={(e) => setModelIds(e.target.value)}
                  placeholder="550e8400-e29b-41d4-a716-446655440000,&#10;550e8400-e29b-41d4-a716-446655440001"
                  rows={3}
                />
              </div>
            )}
            {selectedModelIds.length > 0 && (
              <p className="text-xs text-green-600 font-medium">
                {selectedModelIds.length} model(s) selected
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecallCampaignList() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<RecallCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] =
    useState<RecallCampaign | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmActivate, setShowConfirmActivate] = useState(false);
  const [campaignToActivate, setCampaignToActivate] = useState<string | null>(
    null
  );
  const [activating, setActivating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  useEffect(() => {
    loadCampaigns(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadCampaigns = async (page: number) => {
    try {
      setLoading(true);

      const result = await recallService.getRecallCampaigns({
        page,
        limit: 20,
        status: statusFilter,
      });

      setCampaigns(result.campaigns || []);
      if (result.pagination) {
        setPagination({
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (err) {
      console.error("Error fetching recall campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (campaign: RecallCampaign) => {
    try {
      const detail = await recallService.getRecallCampaignById(
        campaign.recallCampaignId
      );
      setSelectedCampaign(detail);
      setShowDetail(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching campaign detail:", err);
      setError("Failed to load campaign details");
    }
  };

  const handleActivate = (campaignId: string) => {
    setCampaignToActivate(campaignId);
    setShowConfirmActivate(true);
  };

  const confirmActivate = async () => {
    if (!campaignToActivate) return;

    try {
      setActivating(true);
      setError(null);
      await recallService.activateRecallCampaign(campaignToActivate);
      setSuccessMessage("Campaign activated successfully!");
      setShowConfirmActivate(false);
      setCampaignToActivate(null);
      loadCampaigns(pagination.page);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error activating campaign:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message || "Failed to activate campaign"
      );
      setShowConfirmActivate(false);
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="flex gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Success</p>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-400 hover:text-green-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Recall Campaigns
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage vehicle recall campaigns and affected models
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Filter by Status:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                statusFilter === undefined
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ALL
            </button>
            {["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No recall campaigns found</p>
            <p className="text-sm mt-1">
              Create your first recall campaign to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <div
                key={campaign.recallCampaignId}
                className="p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.issueDate).toLocaleDateString()}
                      </span>
                      {campaign.affectedVehicleModels &&
                        campaign.affectedVehicleModels.length > 0 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                            {campaign.affectedVehicleModels.length} Models
                            Affected
                          </span>
                        )}
                      {campaign.affectedVehiclesCount !== undefined && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          {campaign.affectedVehiclesCount} Vehicles
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === "DRAFT" && (
                      <button
                        onClick={() =>
                          handleActivate(campaign.recallCampaignId)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                      >
                        <Rocket className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => openDetail(campaign)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadCampaigns(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => loadCampaigns(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetail && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Campaign Details
                </h2>
                <StatusBadge status={selectedCampaign.status} />
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Campaign Name
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedCampaign.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Issue Date
                  </h3>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedCampaign.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedCampaign.description}
                </p>
              </div>
              {selectedCampaign.affectedVehicleModels &&
                selectedCampaign.affectedVehicleModels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Affected Vehicle Models (
                      {selectedCampaign.affectedVehicleModels.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCampaign.affectedVehicleModels.map((model) => (
                        <div
                          key={model.vehicleModelId}
                          className="bg-orange-50 p-3 rounded-lg border border-orange-200"
                        >
                          <p className="font-medium text-gray-900">
                            {model.vehicleModelName}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {model.sku}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {selectedCampaign.affectedVehiclesCount !== undefined && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-900">
                    <span className="font-medium">
                      Total Affected Vehicles:
                    </span>{" "}
                    <span className="text-lg font-bold">
                      {selectedCampaign.affectedVehiclesCount}
                    </span>
                  </p>
                </div>
              )}
              {selectedCampaign.status === "DRAFT" && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      handleActivate(selectedCampaign.recallCampaignId);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    <Rocket className="w-5 h-5" />
                    Activate Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateRecallModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadCampaigns(1)}
      />

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmActivate}
        onClose={() => {
          setShowConfirmActivate(false);
          setCampaignToActivate(null);
        }}
        onConfirm={confirmActivate}
        title="Activate Recall Campaign"
        message="Are you sure you want to activate this campaign? This will change status from DRAFT to ACTIVE and notify affected customers."
        confirmText="Activate"
        isLoading={activating}
      />
    </div>
  );
}
