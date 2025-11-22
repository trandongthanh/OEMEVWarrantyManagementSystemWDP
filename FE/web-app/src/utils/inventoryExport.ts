/**
 * Inventory Export Utilities
 * Functions to export inventory data to CSV and Excel formats
 */

import { InventorySummary } from "@/services/inventoryService";

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle values with commas or quotes
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"'))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value?.toString() || "";
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Download data as CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export inventory summary to CSV
 */
export function exportInventorySummaryToCSV(
  data: InventorySummary[],
  options: ExportOptions = {}
): void {
  const { filename = "inventory-summary", includeTimestamp = true } = options;

  const exportData = data.map((item) => ({
    "Warehouse ID": item.warehouseId,
    "Warehouse Name": item.warehouseName,
    "Total Stock": item.totalStock,
    "Reserved Stock": item.reservedStock,
    "Available Stock": item.availableStock,
    "Utilization %":
      Math.round((item.reservedStock / item.totalStock) * 100) || 0,
  }));

  const csvContent = arrayToCSV(exportData);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(csvContent, fullFilename);
}

/**
 * Export component stock levels to CSV
 */
export function exportComponentStockToCSV(
  data: Array<{
    componentId: string;
    componentName: string;
    sku: string;
    warehouseName: string;
    quantity: number;
    reserved: number;
    available: number;
    status: string;
  }>,
  options: ExportOptions = {}
): void {
  const { filename = "component-stock", includeTimestamp = true } = options;

  const exportData = data.map((item) => ({
    "Component ID": item.componentId,
    "Component Name": item.componentName,
    SKU: item.sku,
    Warehouse: item.warehouseName,
    Quantity: item.quantity,
    Reserved: item.reserved,
    Available: item.available,
    Status: item.status,
  }));

  const csvContent = arrayToCSV(exportData);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(csvContent, fullFilename);
}

/**
 * Export transfer history to CSV
 */
export function exportTransferHistoryToCSV(
  data: Array<{
    id: string;
    fromWarehouse: string;
    toWarehouse: string;
    componentName: string;
    quantity: number;
    status: string;
    requestedBy: string;
    requestedAt: string;
  }>,
  options: ExportOptions = {}
): void {
  const { filename = "transfer-history", includeTimestamp = true } = options;

  const exportData = data.map((item) => ({
    "Transfer ID": item.id,
    "From Warehouse": item.fromWarehouse,
    "To Warehouse": item.toWarehouse,
    Component: item.componentName,
    Quantity: item.quantity,
    Status: item.status,
    "Requested By": item.requestedBy,
    "Requested Date": new Date(item.requestedAt).toLocaleDateString(),
  }));

  const csvContent = arrayToCSV(exportData);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(csvContent, fullFilename);
}

/**
 * Export allocation history to CSV
 */
export function exportAllocationHistoryToCSV(
  data: Array<{
    id: string;
    componentName: string;
    quantity: number;
    fromWarehouse: string;
    toServiceCenter: string;
    allocatedBy: string;
    allocatedAt: string;
    status: string;
  }>,
  options: ExportOptions = {}
): void {
  const { filename = "allocation-history", includeTimestamp = true } = options;

  const exportData = data.map((item) => ({
    "Allocation ID": item.id,
    Component: item.componentName,
    Quantity: item.quantity,
    "From Warehouse": item.fromWarehouse,
    "To Service Center": item.toServiceCenter,
    "Allocated By": item.allocatedBy,
    "Allocated Date": new Date(item.allocatedAt).toLocaleDateString(),
    Status: item.status,
  }));

  const csvContent = arrayToCSV(exportData);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(csvContent, fullFilename);
}

/**
 * Export low stock items to CSV
 */
export function exportLowStockItemsToCSV(
  data: Array<{
    componentName: string;
    sku: string;
    warehouseName: string;
    currentStock: number;
    threshold: number;
    reorderPoint: number;
  }>,
  options: ExportOptions = {}
): void {
  const { filename = "low-stock-items", includeTimestamp = true } = options;

  const exportData = data.map((item) => ({
    Component: item.componentName,
    SKU: item.sku,
    Warehouse: item.warehouseName,
    "Current Stock": item.currentStock,
    Threshold: item.threshold,
    "Reorder Point": item.reorderPoint,
    "Stock Level": `${Math.round((item.currentStock / item.threshold) * 100)}%`,
  }));

  const csvContent = arrayToCSV(exportData);
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(csvContent, fullFilename);
}

/**
 * Generate a comprehensive inventory report (all data in one file)
 */
export function exportComprehensiveInventoryReport(
  summary: InventorySummary[],
  options: ExportOptions = {}
): void {
  const {
    filename = "inventory-comprehensive-report",
    includeTimestamp = true,
  } = options;

  // Create sections
  const sections: string[] = [];

  // Summary section
  sections.push("INVENTORY SUMMARY");
  sections.push("");
  const summaryData = summary.map((item) => ({
    "Warehouse ID": item.warehouseId,
    "Warehouse Name": item.warehouseName,
    "Total Stock": item.totalStock,
    Reserved: item.reservedStock,
    Available: item.availableStock,
  }));
  sections.push(arrayToCSV(summaryData));
  sections.push("");
  sections.push("");

  // Totals
  const totals = summary.reduce(
    (acc, item) => ({
      total: acc.total + item.totalStock,
      reserved: acc.reserved + item.reservedStock,
      available: acc.available + item.availableStock,
    }),
    { total: 0, reserved: 0, available: 0 }
  );
  sections.push("OVERALL TOTALS");
  sections.push("");
  sections.push(`Total Stock,${totals.total}`);
  sections.push(`Reserved Stock,${totals.reserved}`);
  sections.push(`Available Stock,${totals.available}`);
  sections.push("");
  sections.push("");

  // Report metadata
  sections.push("REPORT METADATA");
  sections.push("");
  sections.push(`Generated Date,${new Date().toLocaleString()}`);
  sections.push(`Total Warehouses,${summary.length}`);

  const reportContent = sections.join("\n");
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  downloadCSV(reportContent, fullFilename);
}

// Export all utilities
const inventoryExportUtils = {
  exportInventorySummaryToCSV,
  exportComponentStockToCSV,
  exportTransferHistoryToCSV,
  exportAllocationHistoryToCSV,
  exportLowStockItemsToCSV,
  exportComprehensiveInventoryReport,
};

export default inventoryExportUtils;
