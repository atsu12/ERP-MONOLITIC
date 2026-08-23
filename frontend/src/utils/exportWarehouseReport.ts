import { useSettingsStore } from "../store/settingsStore";
import { exportExcel } from "./exportExcel";

export function exportWarehouseReport(
  warehouses: any[],
  filters: Record<string, string> = {},
) {
  const { settings } = useSettingsStore.getState();

  const effectiveRate = settings
    ? settings.usd_exchange_rate * settings.company_multiplier
    : 1;

  const rows = warehouses.map((warehouse) => ({
    Warehouse: warehouse.name,

    Products: warehouse.totalProducts,

    Quantity: warehouse.totalQuantity,

    [`Inventory Value (${settings?.display_currency ?? "GHS"})`]: (
      Number(warehouse.inventoryValue) * effectiveRate
    ).toFixed(2),
  }));

  const today = new Date().toISOString().slice(0, 10);

  exportExcel({
    title: "Warehouse Summary Report",

    rows,

    filters,

    sheetName: "Warehouses",

    fileName: `warehouse-summary-${today}.xlsx`,
  });
}
