# Role Permissions Documentation

This document outlines the role-based authorization for case line status management and processing record completion in the OEM EV Warranty Management System.

## Overview

The system has three primary roles for service center operations:

- **service_center_staff** - Front desk staff who manage customer interactions
- **service_center_technician** - Technicians who perform diagnostics and repairs
- **service_center_manager** - Managers with administrative oversight

## Processing Record Status Flow

**Staff** marks the entire processing record as **COMPLETED** (final step):

```
CHECKED_IN → IN_DIAGNOSIS → WAITING_CUSTOMER_APPROVAL → PROCESSING → READY_FOR_PICKUP → COMPLETED
                                                                                              ↑
                                                                                            Staff
```

### Prerequisites for Record Completion

Before staff can mark a record as COMPLETED:

1. Record must be in `READY_FOR_PICKUP` status
2. All case lines must be in final states (COMPLETED, CANCELLED, or REJECTED\_\*)
3. All guarantee cases must be DIAGNOSED

**API Endpoint:** `PATCH /processing-records/{id}/completed`  
**Authorized Roles:** `service_center_staff`, `service_center_manager`

---

## Case Line Status Flow

**Technicians** mark individual repairs as **COMPLETED**:

```
DRAFT → PENDING_APPROVAL → CUSTOMER_APPROVED → READY_FOR_REPAIR → IN_REPAIR → COMPLETED
                                                                                      ↑
                                                                                 Technician
```

---

## Final Case Line Statuses - Role Permissions

The following table documents which roles can set each final case line status:

| Status                          | Role                        | Endpoint/Method                                          | When It's Set                                            | Requirements                                                                    |
| ------------------------------- | --------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **COMPLETED**                   | `service_center_technician` | `PATCH /case-lines/{id}/mark-repair-complete`            | When technician finishes repair work on a case line      | Case line must be in `IN_REPAIR` status                                         |
| **CANCELLED**                   | Multiple (Stock Transfer)   | Stock transfer cancellation flows                        | When related stock transfer request is cancelled         | Part of stock reservation rollback process                                      |
| **REJECTED_BY_OUT_OF_WARRANTY** | `service_center_technician` | `POST /case-lines/case-line` (during creation)           | When component is not covered by warranty                | Set automatically when warranty is expired or component not covered             |
| **REJECTED_BY_TECH**            | `service_center_technician` | `POST /case-lines/case-line` or `PATCH /case-lines/{id}` | When technician deems repair ineligible during diagnosis | Requires `rejectionReason` field to be provided                                 |
| **REJECTED_BY_CUSTOMER**        | `service_center_staff`      | `PATCH /case-lines/approve`                              | When customer declines the proposed repair               | Staff processes customer approval/rejection through `rejectedCaseLineIds` array |

---

## Implementation Details

### Case Line Creation/Update by Technician

When technicians create case lines during diagnosis:

```javascript
// Line 1020-1036 in caseLine.service.js
if (systemWarrantyStatus && warrantyStatusByTech === "ELIGIBLE") {
  initialStatus = "DRAFT";
} else if (systemWarrantyStatus && warrantyStatusByTech === "INELIGIBLE") {
  initialStatus = "REJECTED_BY_TECH";
} else {
  initialStatus = "REJECTED_BY_OUT_OF_WARRANTY";
}
```

**Authorization:** `authorizationByRole(["service_center_technician"])`

**Validation:** When setting `REJECTED_BY_TECH`, a `rejectionReason` is required:

```javascript
// Lines 88, 92 in caseLine.service.js
if (caseline.status === "REJECTED_BY_TECH" && !caseline.rejectionReason) {
  throw new ValidationError(
    "Rejection reason is required for REJECTED_BY_TECH status"
  );
}
```

### Case Line Approval/Rejection by Staff

Staff processes customer decisions on proposed repairs:

```javascript
// Line 484 in caseLine.service.js
// Sets status to REJECTED_BY_CUSTOMER for rejected case lines
```

**API Endpoint:** `PATCH /case-lines/approve`  
**Authorization:** `authorizationByRole(["service_center_staff"])`

**Request Body:**

```json
{
  "approvedCaseLineIds": ["uuid1", "uuid2"],
  "rejectedCaseLineIds": ["uuid3"]
}
```

**Outcomes:**

- Approved IDs → Status changes to `CUSTOMER_APPROVED`
- Rejected IDs → Status changes to `REJECTED_BY_CUSTOMER`

### Mark Repair Complete by Technician

Technicians mark individual repairs as complete:

**API Endpoint:** `PATCH /case-lines/{id}/mark-repair-complete`  
**Authorization:** `authorizationByRole(["service_center_technician"])`

**Outcome:** Case line status changes to `COMPLETED`

---

## Complete Record Button Implementation

### UI Location

The "Complete Record" button appears in the staff dashboard's case details modal.

**Component:** `CasesList.tsx`  
**Display Condition:** Only shown when `record.status === "READY_FOR_PICKUP"`

### Button Behavior

1. Opens `CompleteRecordModal` component
2. Displays vehicle VIN and confirmation message
3. Calls `processingRecordService.completeRecord(recordId)`
4. On success:
   - Sets record status to `COMPLETED`
   - Sets `checkOutDate` to current timestamp
   - Refreshes the records list

### Error Handling

Backend validates prerequisites before allowing completion:

- ❌ Throws `ConflictError` if record is not `READY_FOR_PICKUP`
- ❌ Throws `ConflictError` if any guarantee cases are not `DIAGNOSED`
- ❌ Throws `ConflictError` if any case lines are not in final states

---

## Summary

| Action                         | Role       | Status Changed                                      |
| ------------------------------ | ---------- | --------------------------------------------------- |
| Create case line as ineligible | Technician | `REJECTED_BY_TECH` or `REJECTED_BY_OUT_OF_WARRANTY` |
| Customer rejects repair        | Staff      | `REJECTED_BY_CUSTOMER`                              |
| Complete individual repair     | Technician | `COMPLETED`                                         |
| Complete entire record         | Staff      | Record → `COMPLETED`                                |
| Cancel via stock transfer      | System     | `CANCELLED`                                         |

---

## Related Files

**Frontend:**

- `FE/web-app/src/components/dashboard/staffdashboard/CasesList.tsx` - Staff dashboard with Complete Record button
- `FE/web-app/src/components/dashboard/staffdashboard/CompleteRecordModal.tsx` - Completion confirmation modal
- `FE/web-app/src/services/processingRecordService.ts` - API service for record completion

**Backend:**

- `BE/src/service/vehicleProcessingRecord.service.js` - Record completion logic (lines 385-480)
- `BE/src/service/caseLine.service.js` - Case line status logic
- `BE/src/api/routes/caseLine.router.js` - API routes with authorization
- `BE/src/validators/caseLine.validator.js` - Status validation schemas

---

_Last Updated: 2024_
