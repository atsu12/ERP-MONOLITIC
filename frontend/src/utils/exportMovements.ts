import { exportExcel } from "./exportExcel";

export function exportMovementsToExcel(movements: any[]) {
  const rows = movements.map((movement) => ({
    ID: movement.id,

    Product: movement.product_name,

    Status:
      movement.type === "RECEIVED"
        ? "IN"
        : movement.type === "SCANNED_OUT"
          ? "OUT"
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
    .split("T")[0];

  exportExcel({
    title: "Stock Movements Report",

    rows,

    sheetName: "Movements",

    fileName: `movements-${today}.xlsx`,
  });
}