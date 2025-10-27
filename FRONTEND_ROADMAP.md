# 🚀 FRONTEND IMPLEMENTATION ROADMAP

**Project**: OEM EV Warranty Management System  
**Date**: October 28, 2025  
**Status**: Backend Complete ✅ | Frontend Services Complete ✅ | UI Components Partial ⚠️

---

## ✅ **COMPLETED - BACKEND SERVICES**

All API services are now implemented and ready to use:

### **Core Services**

- ✅ `authService` - Login, authentication
- ✅ `userService` - User management, technician listing
- ✅ `customerService` - Customer CRUD operations
- ✅ `vehicleService` - Vehicle lookup, warranty checking, registration
- ✅ `warehouseService` - Warehouse and stock management
- ✅ `chatService` - Real-time chat (guest + staff)

### **Warranty Processing Services**

- ✅ `claimService` - Create processing records
- ✅ `processingRecordService` - Record management, diagnosis completion, record completion
- ✅ `technicianService` - Technician workflows, caseline creation
- ✅ `caseLineService` - Caseline CRUD, approval, allocation, repair completion, listing with filters
- ✅ `stockTransferService` - Full stock transfer request lifecycle (8 endpoints)
- ✅ `componentReservationService` - Component pickup, install, return

---

## 🎯 **NEXT STEPS - UI COMPONENTS TO BUILD**

### **PRIORITY 1: Critical Missing UI Components** 🔴

#### **1. Stock Transfer Request Management** (FLOW 4)

**Status**: NO UI EXISTS ❌

**Components Needed**:

```
📁 FE/web-app/src/components/dashboard/
├── managerdashboard/
│   ├── StockTransferRequestList.tsx          ⭐ NEW
│   ├── CreateStockTransferRequestModal.tsx   ⭐ NEW
│   └── StockTransferRequestDetail.tsx        ⭐ NEW
├── staffdashboard/
│   └── ApproveStockTransferModal.tsx         ⭐ NEW (for EMV staff)
└── partsdashboard/                           ⭐ NEW FOLDER
    ├── CompanyPartsCoordinatorDashboard.tsx  ⭐ NEW
    ├── ShipStockTransferModal.tsx            ⭐ NEW
    └── ReceiveStockTransferModal.tsx         ⭐ NEW
```

**Features Required**:

- [ ] Manager: Create transfer request when stock allocation fails (409 error)
- [ ] Manager: View request list with status filters
- [ ] Manager: Cancel requests
- [ ] EMV Staff: Approve/reject requests with reasons
- [ ] Parts Coordinator (Company): Ship requests with delivery date
- [ ] Parts Coordinator (SC): Receive shipments
- [ ] Auto-refresh caseline status after receiving

**API Integration**:

```typescript
// Already available in stockTransferService:
-createRequest() -
  getRequests(params) -
  getRequestById(id) -
  approveRequest(id) -
  rejectRequest(id, { rejectionReason }) -
  shipRequest(id, { estimatedDeliveryDate }) -
  receiveRequest(id) -
  cancelRequest(id, { cancellationReason });
```

---

#### **2. Component Reservation Workflow UI**

**Status**: PARTIAL - Technicians have diagnosis UI, but missing pickup/install/return flow ⚠️

**Components Needed**:

```
📁 FE/web-app/src/components/dashboard/
├── partsdashboard/
│   ├── ComponentPickupList.tsx               ⭐ NEW
│   ├── ComponentReturnForm.tsx               ⭐ NEW
│   └── ReservationTracker.tsx                ⭐ NEW
└── techniciandashboard/
    ├── ComponentInstallModal.tsx             ⭐ NEW
    └── RepairProgressTracker.tsx             ⭐ UPDATE
```

**Features Required**:

- [ ] Parts Coordinator: List of reserved components ready for pickup
- [ ] Parts Coordinator: Pickup component (RESERVED → PICKED_UP)
- [ ] Technician: Install component on vehicle (PICKED_UP → INSTALLED)
- [ ] Parts Coordinator: Return old component with serial number (INSTALLED → RETURNED)
- [ ] Real-time status tracking

**API Integration**:

```typescript
// Already available in componentReservationService:
-pickupComponent(reservationId) -
  installComponent(reservationId) -
  returnComponent(reservationId, { serialNumber }) -
  getReservationById(reservationId);
```

---

#### **3. Complete Diagnosis & Complete Record UI**

**Status**: MISSING ❌

**Components Needed**:

```
📁 FE/web-app/src/components/dashboard/
└── techniciandashboard/
    ├── CompleteDiagnosisButton.tsx           ⭐ NEW
    └── DiagnosisReviewModal.tsx              ⭐ NEW
└── staffdashboard/
    └── CompleteRecordModal.tsx               ⭐ NEW
```

**Features Required**:

- [ ] Technician: Review all caselines before completing diagnosis
- [ ] Technician: Complete diagnosis button (transitions to WAITING_CUSTOMER_APPROVAL)
- [ ] Staff: Final record completion (sets checkout date, status → COMPLETED)
- [ ] Validation: All caselines must be COMPLETED before closing record

**API Integration**:

```typescript
// Already available in processingRecordService:
-completeDiagnosis(recordId) - completeRecord(recordId);
```

---

#### **4. Mark Repair Complete UI**

**Status**: MISSING ❌

**Components Needed**:

```
📁 FE/web-app/src/components/dashboard/
└── techniciandashboard/
    ├── MarkRepairCompleteButton.tsx          ⭐ NEW
    └── RepairCompletionChecklist.tsx         ⭐ NEW
```

**Features Required**:

- [ ] Technician: Mark individual caseline repairs as complete
- [ ] Validation: Caseline must be IN_REPAIR status
- [ ] Automatic status update to COMPLETED

**API Integration**:

```typescript
// Already available in caseLineService:
-markRepairComplete(caselineId);
```

---

### **PRIORITY 2: Enhanced Features** 🟡

#### **5. Advanced CaseLine Filtering & Search**

**Status**: Basic list exists, needs advanced filtering ⚠️

**Update Components**:

```
📁 FE/web-app/src/components/dashboard/
├── staffdashboard/
│   └── CasesList.tsx                         ⭐ UPDATE - Add filters
└── managerdashboard/
    └── ManagerCasesList.tsx                  ⭐ UPDATE - Add filters
```

**Features to Add**:

- [ ] Filter by: status, warrantyStatus, vehicleProcessingRecordId, technicianId
- [ ] Sort by: createdAt, updatedAt, status, warrantyStatus
- [ ] Pagination controls
- [ ] Search by guarantee case ID

**API Already Available**:

```typescript
caseLineService.getCaseLinesList({
  page: 1,
  limit: 10,
  status: "PENDING_APPROVAL",
  vehicleProcessingRecordId: "uuid",
  diagnosticTechId: "uuid",
  repairTechId: "uuid",
  sortBy: "createdAt",
  sortOrder: "DESC",
});
```

---

#### **6. Real-time Notifications for Stock Transfers**

**Status**: NOT IMPLEMENTED ❌

**Components Needed**:

```
📁 FE/web-app/src/components/
└── notifications/
    ├── StockTransferNotification.tsx         ⭐ NEW
    └── NotificationBadge.tsx                 ⭐ NEW
```

**Features Required**:

- [ ] Notify managers when transfer request status changes
- [ ] Notify parts coordinators when items are ready to ship/receive
- [ ] Badge counter for pending actions

**Socket Integration**:

```typescript
// Use existing notification socket from lib/socket.ts
notificationSocket.on("stockTransferStatusChanged", (data) => {
  // Update UI
});
```

---

#### **7. Workflow Status Timeline**

**Status**: NOT IMPLEMENTED ❌

**Components Needed**:

```
📁 FE/web-app/src/components/shared/
└── WorkflowTimeline.tsx                      ⭐ NEW
```

**Features Required**:

- [ ] Visual timeline showing record progression
- [ ] Highlight current step
- [ ] Show completion dates
- [ ] Works for: ProcessingRecord, CaseLine, StockTransferRequest

---

### **PRIORITY 3: User Experience Enhancements** 🟢

#### **8. Error Handling & User Feedback**

**Features to Add**:

- [ ] Handle 409 Conflict (insufficient stock) → Show "Order from Company" button
- [ ] Handle 403 Forbidden → Show role requirement message
- [ ] Toast notifications for success/error
- [ ] Loading states for all async operations
- [ ] Retry mechanisms for failed requests

**Example**:

```typescript
try {
  await caseLineService.allocateStock(caselineId, caseId);
  toast.success("Stock allocated successfully!");
} catch (error: any) {
  if (error.response?.status === 409) {
    // Show "Create Stock Transfer Request" modal
    setShowStockTransferModal(true);
  } else {
    toast.error("Failed to allocate stock");
  }
}
```

---

#### **9. Role-Based UI Display**

**Features to Add**:

- [ ] Hide/show buttons based on user role
- [ ] Disable actions user doesn't have permission for
- [ ] Show role-specific dashboards

**Example**:

```typescript
const userRole = localStorage.getItem("userRole");

{
  userRole === "service_center_manager" && (
    <button onClick={handleAllocateStock}>Allocate Stock</button>
  );
}

{
  userRole === "service_center_technician" && (
    <button onClick={handleMarkRepairComplete}>Mark Complete</button>
  );
}
```

---

#### **10. Bulk Operations**

**Features to Add**:

- [ ] Select multiple caselines for approval
- [ ] Batch allocate stock
- [ ] Bulk assign technicians

---

### **PRIORITY 4: Dashboard Improvements** 🔵

#### **11. Manager Dashboard Enhancements**

**Features to Add**:

- [ ] Pending stock transfer requests count
- [ ] Low stock alerts
- [ ] Overdue repairs tracker
- [ ] Team workload distribution chart

---

#### **12. Technician Dashboard Enhancements**

**Features to Add**:

- [ ] My active repairs list
- [ ] Components waiting for pickup
- [ ] Repair completion checklist
- [ ] Time tracking per repair

---

#### **13. Parts Coordinator Dashboard** (NEW ROLE UI)

**Create New Dashboard**:

```
📁 FE/web-app/src/components/dashboard/
└── partscoordinatordashboard/                ⭐ NEW FOLDER
    ├── index.tsx
    ├── DashboardOverview.tsx
    ├── PendingPickups.tsx
    ├── PendingReturns.tsx
    ├── IncomingShipments.tsx
    └── OutgoingShipments.tsx
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Week 1: Critical Missing Features**

- [ ] Create StockTransferRequestList component
- [ ] Create CreateStockTransferRequestModal
- [ ] Implement approve/reject workflow for EMV staff
- [ ] Create ship/receive workflow for parts coordinators
- [ ] Add ComponentPickupList component
- [ ] Add ComponentInstallModal for technicians
- [ ] Add ComponentReturnForm

### **Week 2: Complete Workflows**

- [ ] Add CompleteDiagnosisButton
- [ ] Add CompleteRecordModal
- [ ] Add MarkRepairCompleteButton
- [ ] Implement 409 error handling for stock allocation
- [ ] Add role-based button visibility

### **Week 3: Enhanced Features**

- [ ] Add advanced filtering to CasesList
- [ ] Implement WorkflowTimeline component
- [ ] Add real-time notifications
- [ ] Create Parts Coordinator dashboard

### **Week 4: Polish & Testing**

- [ ] Add loading states everywhere
- [ ] Implement toast notifications
- [ ] Add error boundaries
- [ ] End-to-end workflow testing
- [ ] Performance optimization

---

## 🛠️ **TECHNICAL NOTES**

### **Available Services (Ready to Use)**

All these services are fully implemented and tested:

- `stockTransferService` - 8 methods ✅
- `componentReservationService` - 4 methods ✅
- `processingRecordService` - 6 methods (including new ones) ✅
- `caseLineService` - 7 methods (including new ones) ✅

### **Role-Based Access Control**

Always check backend authorization before calling APIs:

| Endpoint                | Allowed Roles                      |
| ----------------------- | ---------------------------------- |
| Create Stock Transfer   | `service_center_manager`           |
| Approve/Reject Transfer | `emv_staff`                        |
| Ship Transfer           | `parts_coordinator_company`        |
| Receive Transfer        | `parts_coordinator_service_center` |
| Pickup Component        | `parts_coordinator_service_center` |
| Install Component       | `service_center_technician`        |
| Return Component        | `parts_coordinator_service_center` |
| Complete Diagnosis      | `service_center_technician`        |
| Mark Repair Complete    | `service_center_technician`        |
| Complete Record         | `service_center_staff`             |

### **Error Handling Pattern**

```typescript
try {
  const result = await someService.someMethod(params);
  toast.success("Operation successful!");
  // Update UI state
} catch (error: any) {
  if (error.response?.status === 409) {
    // Handle conflict (e.g., out of stock)
  } else if (error.response?.status === 403) {
    toast.error("You don't have permission for this action");
  } else {
    toast.error(error.response?.data?.message || "Operation failed");
  }
  console.error("Error:", error);
}
```

---

## 🎨 **UI/UX GUIDELINES**

### **Status Colors**

```typescript
const statusColors = {
  // ProcessingRecord
  CHECKED_IN: "bg-blue-100 text-blue-800",
  IN_DIAGNOSIS: "bg-yellow-100 text-yellow-800",
  WAITING_CUSTOMER_APPROVAL: "bg-orange-100 text-orange-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  READY_FOR_PICKUP: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",

  // CaseLine
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  CUSTOMER_APPROVED: "bg-blue-100 text-blue-700",
  READY_FOR_REPAIR: "bg-cyan-100 text-cyan-700",
  WAITING_FOR_PARTS: "bg-orange-100 text-orange-700",
  IN_REPAIR: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",

  // StockTransferRequest
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  RECEIVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};
```

### **Icons for Actions**

- Create: `Plus`
- Approve: `CheckCircle`
- Reject: `XCircle`
- Ship: `Truck`
- Receive: `PackageCheck`
- Pickup: `Package`
- Install: `Wrench`
- Return: `RotateCcw`
- Complete: `CheckSquare`

---

## 📊 **SUCCESS METRICS**

Track these to ensure implementation success:

- [ ] All 5 workflow stages can be completed end-to-end
- [ ] Stock transfer requests complete without errors
- [ ] Component lifecycle tracked properly (reserved → picked up → installed → returned)
- [ ] All role-based access controls working
- [ ] Zero broken API calls (check browser console)
- [ ] Average processing record completion time < 2 days (mock data)

---

## 🔗 **RELATED DOCUMENTATION**

- [Test Plan (TEST_PLAN.md)](./TEST_PLAN.md)
- [Backend API Swagger](http://localhost:3000/api-docs)
- [Service Documentation](./FE/web-app/src/services/README.md)

---

**Last Updated**: October 28, 2025  
**Maintained By**: Development Team
