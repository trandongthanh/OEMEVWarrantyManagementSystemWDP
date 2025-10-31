export const getStatusStyle = (status) => {
  const stylesMap = {
    CHECKED_IN: { bg: "#E0F2FE", text: "#0369A1" },
    IN_DIAGNOSIS: { bg: "#F3E8FF", text: "#7E22CE" },
    WAITING_FOR_PARTS: { bg: "#FEF9C3", text: "#B45309" },
    IN_REPAIR: { bg: "#FFF7ED", text: "#EA580C" },
    COMPLETED: { bg: "#DCFCE7", text: "#16A34A" },
    CANCELLED: { bg: "#FEE2E2", text: "#DC2626" },
  };
  return stylesMap[status] || { bg: "#F3F4F6", text: "#4B5563" };
};