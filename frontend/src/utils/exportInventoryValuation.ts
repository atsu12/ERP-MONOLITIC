import { useSettingsStore } from "../store/settingsStore";

import { exportExcel } from "./exportExcel";

export function exportInventoryValuation(
  items: any[],
  filters: Record<string, string> = {},
) {
  const { settings } = useSettingsStore.getState();

  const effectiveRate = settings
    ? settings.usd_exchange_rate * settings.company_multiplier
    : 1;

  const rows = items.map((item) => ({
    "Product ID": item.id,

    Product: item.name,

    Brand: item.brand,

    Category: item.category,

    Quantity: item.quantity,

    [`Unit Price (${settings?.display_currency ?? "GHS"})`]:
      (Number(item.price) * effectiveRate).toFixed(2),

    [`Inventory Value (${settings?.display_currency ?? "GHS"})`]:
      (Number(item.inventoryValue) * effectiveRate).toFixed(2),
  }));

  const today = new Date().toISOString().slice(0, 10);

  exportExcel({
    title: "Inventory Valuation Report",

    rows,

    filters,

    sheetName: "Inventory Valuation",

    fileName: `inventory-valuation-${today}.xlsx`,
  });
}
