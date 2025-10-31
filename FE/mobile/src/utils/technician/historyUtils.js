import { CheckCircle, X } from "lucide-react-native";

export const statusConfig = {
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "#16A34A" },
  CANCELLED: { label: "Cancelled", icon: X, color: "#DC2626" },
};

export const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];