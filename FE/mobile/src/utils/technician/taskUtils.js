import {
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  X,
} from "lucide-react-native";

// --- Cấu hình Status ---
export const statusConfig = {
  CHECKED_IN: { label: "Checked In", icon: CheckCircle, color: "#0369A1" },
  IN_DIAGNOSIS: { label: "In Diagnosis", icon: Clock, color: "#7E22CE" },
  WAITING_FOR_PARTS: {
    label: "Waiting Parts",
    icon: AlertCircle,
    color: "#B45309",
  },
  IN_REPAIR: { label: "In Repair", icon: Wrench, color: "#EA580C" },
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "#16A34A" },
  CANCELLED: { label: "Cancelled", icon: X, color: "#DC2626" },
};

export const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Checked In", value: "CHECKED_IN" },
  { label: "In Diagnosis", value: "IN_DIAGNOSIS" },
  { label: "Waiting Parts", value: "WAITING_FOR_PARTS" },
  { label: "In Repair", value: "IN_REPAIR" },
  { label: "Completed", value: "COMPLETED" },
];