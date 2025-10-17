# Backend Implementation Requirements

## TasksView Component (`src/components/dashboard/managerdashboard/TasksView.tsx`)

### Missing Backend Endpoints:

1. **Task Service - Get All Tasks**
   - **Location**: Line 110-112
   - **Current Implementation**: Mock data (empty array)
   - **Required Endpoint**: `GET /api/tasks` or similar
   - **Purpose**: Fetch all tasks across the system for manager overview
   - **Expected Response**: Array of task objects with technician assignments

2. **Task Reassignment Service**
   - **Location**: Line 133-136
   - **Current Implementation**: Alert message only
   - **Required Endpoint**: `PUT /api/tasks/{taskId}/reassign`
   - **Purpose**: Reassign tasks from one technician to another
   - **Expected Payload**: `{ technicianId: string }`

## AssignmentsManagement Component (`src/components/dashboard/managerdashboard/AssignmentsManagement.tsx`)

### Missing Backend Endpoints:

1. **Lead Technician Assignment**
   - **Location**: Line 126-129
   - **Current Implementation**: Alert message only
   - **Required Endpoint**: `PUT /api/guarantee-cases/{caseId}/lead-technician`
   - **Purpose**: Assign lead technician to a guarantee case
   - **Expected Payload**: `{ technicianId: string }`

2. **Task Creation Service**
   - **Location**: Line 143-146
   - **Current Implementation**: Alert message with task type and case ID
   - **Required Endpoint**: `POST /api/tasks`
   - **Purpose**: Create diagnosis or repair tasks for guarantee cases
   - **Expected Payload**: `{ guaranteeCaseId: string, taskType: "DIAGNOSIS" | "REPAIR" }`

## MyTasks Component (`src/components/dashboard/techniciandashboard/MyTasks.tsx`)

### Missing Backend Endpoints:

1. **Task Service - Get Technician Tasks**
   - **Location**: Line 99-101
   - **Current Implementation**: Mock data (empty array)
   - **Required Endpoint**: `GET /api/technicians/{technicianId}/tasks`
   - **Purpose**: Fetch tasks assigned to the current technician
   - **Expected Response**: Array of task objects assigned to technician

2. **Task Status Update Service**
   - **Location**: Line 116-119
   - **Current Implementation**: Alert message only
   - **Required Endpoint**: `PUT /api/tasks/{taskId}/status`
   - **Purpose**: Update task status (PENDING → IN_PROGRESS → COMPLETED)
   - **Expected Payload**: `{ status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }`

## ReportSubmission Modal (`src/components/dashboard/shared/ReportSubmission.tsx`)

### Missing Backend Endpoints:

1. **Report Submission Service**
   - **Location**: Line 117-118
   - **Current Implementation**: Alert message with report data
   - **Required Endpoint**: `POST /api/reports` or `POST /api/tasks/{taskId}/reports`
   - **Purpose**: Submit technician reports for completed tasks
   - **Expected Payload**: Report data object with task details, findings, and recommendations

## Implementation Priority

### High Priority (Core Functionality):
1. Task Service - Get tasks for TasksView and MyTasks
2. Task Status Update - Essential for workflow progression
3. Task Creation - Required for manager assignments

### Medium Priority (Enhanced Features):
1. Task Reassignment - Improves workflow flexibility
2. Lead Technician Assignment - Organizational feature
3. Report Submission - Documentation/compliance feature

## Data Models Required

### Task Model:
```typescript
interface Task {
  taskId: string;
  guaranteeCaseId: string;
  taskType: "DIAGNOSIS" | "REPAIR";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  technicianId: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Report Model:
```typescript
interface TaskReport {
  reportId: string;
  taskId: string;
  technicianId: string;
  reportData: {
    findings: string;
    actions: string;
    recommendations: string;
    // Additional report fields
  };
  submittedAt: string;
}
```</content>
<parameter name="filePath">c:\Users\Admin\Documents\GitHub\OEMEVWarrantyManagementSystemWDP\BACKEND_IMPLEMENTATION_REQUIREMENTS.md