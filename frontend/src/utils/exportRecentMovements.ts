import { exportExcel } from "./exportExcel";

export function exportRecentMovements(
  movements: any[],
  filters: Record<string, string> = {},
) {
  const rows = movements.map((movement) => ({
    Product: movement.product_name,

    Type:
      movement.type === "RECEIVED"
        ? "IN"
        : movement.type === "SCANNED_OUT"
          ? "OUT"
          : movement.type === "SCANNED_IN"
            ? "IN"
            : movement.type,

    Quantity: movement.quantity,

    Date: new Date(movement.created_at).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    ),
  }));

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  exportExcel({
    title: "Recent Inventory Movements Report",

    rows,

    filters,

    sheetName: "Recent Movements",

    fileName: `recent-movements-${today}.xlsx`,
  });
}
