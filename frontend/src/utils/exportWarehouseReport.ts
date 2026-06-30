import { exportExcel } from "./exportExcel";

export function exportWarehouseReport(
  warehouses: any[],
  filters: Record<string, string> = {},
) {
  const rows = warehouses.map((warehouse) => ({
    Warehouse: warehouse.name,

    Products: warehouse.totalProducts,

    Quantity: warehouse.totalQuantity,

    "Inventory Value": Number(
      warehouse.inventoryValue,
    ).toFixed(2),
  }));

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  exportExcel({
  title: "Warehouse Summary Report",

  rows,

  filters,

  sheetName: "Warehouses",

  fileName: `warehouse-summary-${today}.xlsx`,
});
}
