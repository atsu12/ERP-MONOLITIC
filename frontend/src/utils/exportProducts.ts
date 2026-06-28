import { exportExcel } from "./exportExcel";

export function exportProductsToExcel(
  products: any[],
  settings: any,
) {
  const effectiveRate = settings
    ? settings.usd_exchange_rate *
      settings.company_multiplier
    : 1;

  const rows = products.map((product) => ({
    "Product ID": product.id,

    Name: product.name,

    Brand: product.brand,

    Category: product.category || "-",

    Quantity: product.quantity,

    "USD Price": Number(
      product.price || 0,
    ).toFixed(2),

    Currency:
      settings?.display_currency || "USD",

    "Display Price": (
      Number(product.price || 0) *
      effectiveRate
    ).toFixed(2),
  }));

  const today = new Date()
    .toISOString()
    .split("T")[0];

  exportExcel({
    title: "Products Report",

    company:
      settings?.company_name ??
      "ZICO BUSINESS ERP",

    rows,

    sheetName: "Products",

    fileName: `selected-products-${today}.xlsx`,
  });
}