import { exportExcel } from "./exportExcel";

export function exportInventoryValuation(
  items: any[],
  filters: Record<string, string> = {},
) {
  const rows = items.map((item) => ({
    "Product ID": item.id,

    Product: item.name,

    Brand: item.brand,

    Category: item.category,

    Quantity: item.quantity,

    "Unit Price": Number(item.price).toFixed(2),

    "Inventory Value": Number(item.inventoryValue).toFixed(2),
  }));

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  exportExcel({
    title: "Inventory Valuation Report",

    rows,

    filters,

    sheetName: "Inventory Valuation",

    fileName: `inventory-valuation-${today}.xlsx`,
  });
}
