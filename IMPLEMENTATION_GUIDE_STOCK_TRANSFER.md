# 🚀 Quick Start: Stock Transfer Request Implementation

**Priority**: 🔴 CRITICAL - Blocks entire FLOW 4 (ordering parts from company)

---

## 📋 **What You're Building**

A complete UI for handling stock transfer requests when service centers run out of parts:

1. **Manager** creates request when stock allocation fails (409 error)
2. **EMV Staff** approves/rejects request
3. **Parts Coordinator (Company)** ships approved items
4. **Parts Coordinator (SC)** receives shipment
5. **System** auto-transitions caselines from WAITING_FOR_PARTS → READY_FOR_REPAIR

---

## 🎯 **Step 1: Handle Stock Allocation Failure**

Update `CaseLineDetailModal.tsx` to catch 409 errors:

```typescript
// In CaseLineDetailModal.tsx or wherever you allocate stock
import { useState } from "react";
import { caseLineService, stockTransferService } from "@/services";

const [showStockTransferModal, setShowStockTransferModal] = useState(false);
const [insufficientStock, setInsufficientStock] = useState<{
  typeComponentId: string;
  quantityNeeded: number;
  caselineId: string;
} | null>(null);

const handleAllocateStock = async (caselineId: string, caseId: string) => {
  try {
    await caseLineService.allocateStock(caselineId, caseId);
    toast.success("Stock allocated successfully!");
    // Refresh data
  } catch (error: any) {
    if (error.response?.status === 409) {
      // Not enough stock - show modal to create transfer request
      const errorData = error.response?.data;
      setInsufficientStock({
        typeComponentId: errorData.typeComponentId,
        quantityNeeded: errorData.quantityNeeded || 1,
        caselineId: caselineId,
      });
      setShowStockTransferModal(true);
    } else {
      toast.error("Failed to allocate stock");
    }
  }
};

// In JSX
{
  showStockTransferModal && insufficientStock && (
    <CreateStockTransferRequestModal
      isOpen={showStockTransferModal}
      onClose={() => setShowStockTransferModal(false)}
      initialData={{
        typeComponentId: insufficientStock.typeComponentId,
        quantityNeeded: insufficientStock.quantityNeeded,
        caselineIds: [insufficientStock.caselineId],
      }}
      onSuccess={() => {
        setShowStockTransferModal(false);
        toast.success("Stock transfer request created!");
      }}
    />
  );
}
```

---

## 🎯 **Step 2: Create Stock Transfer Request Modal**

Create: `FE/web-app/src/components/dashboard/managerdashboard/CreateStockTransferRequestModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Package } from "lucide-react";
import { stockTransferService } from "@/services";
import type { StockTransferRequestItem } from "@/services";

interface CreateStockTransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    typeComponentId: string;
    quantityNeeded: number;
    caselineIds: string[];
  };
}

export default function CreateStockTransferRequestModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateStockTransferRequestModalProps) {
  const [items, setItems] = useState<StockTransferRequestItem[]>(
    initialData
      ? [
          {
            typeComponentId: initialData.typeComponentId,
            quantityRequested: initialData.quantityNeeded,
            caselineId: initialData.caselineIds[0],
          },
        ]
      : []
  );
  const [caselineIds, setCaselineIds] = useState<string[]>(
    initialData?.caselineIds || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get warehouse ID from user context
  const warehouseId = localStorage.getItem("warehouseId") || "";

  const handleAddItem = () => {
    setItems([...items, { typeComponentId: "", quantityRequested: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof StockTransferRequestItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await stockTransferService.createRequest({
        requestingWarehouseId: warehouseId,
        items: items,
        caselineIds: caselineIds,
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating stock transfer request:", error);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">Request Stock from Company</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Components Needed</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add Component
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Component Type ID"
                    value={item.typeComponentId}
                    onChange={(e) =>
                      handleItemChange(index, "typeComponentId", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantityRequested}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantityRequested",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Caseline IDs (Optional - for tracking) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Related Caseline IDs (Optional)
            </label>
            <textarea
              value={caselineIds.join(", ")}
              onChange={(e) =>
                setCaselineIds(e.target.value.split(",").map((id) => id.trim()))
              }
              placeholder="Enter caseline IDs separated by commas"
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
```

---

## 🎯 **Step 3: Stock Transfer Request List**

Create: `FE/web-app/src/components/dashboard/managerdashboard/StockTransferRequestList.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { stockTransferService } from "@/services";
import type { StockTransferRequest } from "@/services";

export default function StockTransferRequestList() {
  const [requests, setRequests] = useState<StockTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await stockTransferService.getRequests({
        page: 1,
        limit: 50,
        ...(statusFilter !== "all" && { status: statusFilter as any }),
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "RECEIVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      RECEIVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Stock Transfer Requests</h2>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="SHIPPED">Shipped</option>
          <option value="RECEIVED">Received</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No requests found</div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Request ID: {request.id}</p>
                    <p>
                      Created: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.requestingWarehouse && (
                      <p>
                        Warehouse: {request.requestingWarehouse.warehouseName}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  {request.items && request.items.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold text-sm mb-2">Items:</p>
                      <ul className="space-y-1">
                        {request.items.map((item) => (
                          <li key={item.id} className="text-sm text-gray-600">
                            • {item.typeComponent?.name || item.typeComponentId}{" "}
                            x {item.quantityRequested}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions - based on user role and status */}
                <div className="flex gap-2">
                  {/* Add action buttons here based on role */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 **Step 4: Add to Manager Dashboard**

Update: `FE/web-app/src/components/dashboard/managerdashboard/index.ts`

```typescript
export { default as DashboardOverview } from "./DashboardOverview";
export { default as CaseLineManagement } from "./CaseLineManagement";
export { default as StockTransferRequestList } from "./StockTransferRequestList";
export { default as CreateStockTransferRequestModal } from "./CreateStockTransferRequestModal";
// ... other exports
```

Then add a tab/section in the manager dashboard to display `<StockTransferRequestList />`.

---

## 🎯 **Step 5: Test the Flow**

1. **Create a caseline** that needs a component
2. **Approve the caseline** (status → CUSTOMER_APPROVED)
3. **Try to allocate stock** - Backend returns 409 if insufficient
4. **Modal opens** with pre-filled component ID and quantity
5. **Submit request** - Status is PENDING_APPROVAL
6. **View in list** - Manager sees the request
7. **EMV staff approves** - Status → APPROVED
8. **Company ships** - Status → SHIPPED
9. **SC receives** - Status → RECEIVED, caseline → READY_FOR_REPAIR

---

## 📚 **Next Components to Build**

After stock transfer works:

1. Component pickup/install/return workflow
2. Complete diagnosis button
3. Mark repair complete button
4. Complete record button

---

## 🛠️ **Tips**

- Always check user role before showing buttons
- Use `localStorage.getItem("userRole")` for role checks
- Handle loading states
- Add toast notifications for user feedback
- Test with different roles

**Need help?** Check the full `FRONTEND_ROADMAP.md` for complete implementation guide!
