import { exportExcel } from "./exportExcel";

export function exportFastMovingProducts(
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
    title: "Fast Moving Products Report",

    rows,

    filters,

    sheetName: "Fast Moving",

    fileName: `fast-moving-products-${today}.xlsx`,
  });
}
