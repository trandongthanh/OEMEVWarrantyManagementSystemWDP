# Frontend Issues to Fix

## 🔴 Critical (Production Blockers)

### 1. Component Reservations - Wrong Base Path

- **File**: `FE/web-app/src/services/componentReservationService.ts`
- **Issue**: Using `/component-reservations/` but backend expects `/reservations/`
- **Lines**: 110, 134, 159, 182
- **Fix**: Replace all `/component-reservations/` with `/reservations/`

### 2. Stock Allocation - Wrong Route Structure

- **File**: `FE/web-app/src/services/caseLineService.ts`
- **Issue**: Using nested path `/guarantee-cases/{caseId}/case-lines/{caselineId}/allocate-stock` but backend expects `/case-lines/{caselineId}/allocate-stock`
- **Lines**: 227-238
- **Fix**:
  - Remove `caseId` parameter from method signature
  - Change path to `/case-lines/${caselineId}/allocate-stock`
  - Update all callers

## 🟡 Medium Priority

### 3. Vehicle History - Route Name Mismatch

- **File**: `FE/web-app/src/services/vehicleService.ts`
- **Issue**: Frontend uses `/vehicles/${vin}/history` but backend route is `/vehicles/${vin}/service-history`
- **Line**: 223
- **Fix**: Change path to `/vehicles/${vin}/service-history`

### 4. Update Case Line - Nested Route Issue

- **File**: `FE/web-app/src/services/caseLineService.ts`
- **Issue**: Using nested path `/guarantee-cases/${caseId}/case-lines/${caselineId}` but backend expects `/case-lines/${caselineId}`
- **Lines**: 189-206
- **Fix**:
  - Remove `caseId` parameter from method signature
  - Change path to `/case-lines/${caselineId}`
  - Update all callers

## 🟢 Low Priority

### 5. Component Status Type Definition

- **File**: `FE/web-app/src/types/component.ts` (if exists)
- **Issue**: Frontend expects `IN_STOCK` enum value but backend returns `REMOVED` for removed components
- **Fix**: Update type definitions to match backend enums
