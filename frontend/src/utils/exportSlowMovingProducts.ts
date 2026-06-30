import { exportExcel } from "./exportExcel";

export function exportSlowMovingProducts(
  products: any[],
  filters: Record<string, string> = {},
) {
  const rows = products.map((product) => ({
    "Product ID": product.id,

    Product: product.name,

    "Units Out": product.totalOut,
  }));

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  exportExcel({
    title: "Slow Moving Products Report",

    rows,

    filters,

    sheetName: "Slow Moving",

    fileName: `slow-moving-products-${today}.xlsx`,
  });
}
