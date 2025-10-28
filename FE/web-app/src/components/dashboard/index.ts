export { default as Sidebar } from "./Sidebar";
export { DashboardHeader } from "./DashboardHeader";
export { NewClaimModal } from "./NewClaimModal";
export { PlaceholderContent } from "./PlaceholderContent";
export { RegisterVehicleModal } from "./RegisterVehicleModal";

// Staff Dashboard Components
export {
  DashboardOverview,
  CustomerSearchResults,
  CasesList,
} from "./staffdashboard";

// Manager Dashboard Components
export {
  DashboardOverview as ManagerDashboardOverview,
  ManagerCasesList,
  CustomerManagement,
  CaseLineManagement,
} from "./managerdashboard";

// Technician Dashboard Components
export {
  DashboardOverview as TechnicianDashboardOverview,
  MyTasks,
  PartsInventory,
  WorkHistory,
} from "./techniciandashboard";

// Parts Coordinator Dashboard Components
export {
  DashboardOverview as PartsCoordinatorDashboardOverview,
  ComponentPickupList,
  ComponentReturnForm,
} from "./partscoordinator";
