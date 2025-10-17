export { default as Sidebar } from "./Sidebar";
export { DashboardHeader } from "./DashboardHeader";
export { NewClaimModal } from "./NewClaimModal";
export { PlaceholderContent } from "./PlaceholderContent";
export { RegisterVehicleModal } from "./RegisterVehicleModal";

// Staff Dashboard Components
export {
  DashboardOverview,
  VehicleManagement,
  CustomerSearchResults,
  CasesList,
} from "./staffdashboard";

// Manager Dashboard Components
export {
  DashboardOverview as ManagerDashboardOverview,
  ManagerCasesList,
  AssignmentsManagement,
  TasksView,
} from "./managerdashboard";

// Technician Dashboard Components
export { TechnicianDashboardOverview, MyTasks } from "./techniciandashboard";

// Shared Dashboard Components
export { ReportSubmission } from "./shared";
