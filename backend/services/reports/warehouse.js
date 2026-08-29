const query = require("./query");

async function getWarehouseSummary(filters = {}) {
  const conditions = [];
  const params = [];

  /* =========================
     WAREHOUSE
  ========================= */

  if (filters.warehouse) {
    conditions.push("w.id = ?");
    params.push(filters.warehouse);
  }

  /* =========================
     CATEGORY
  ========================= */

  if (filters.category) {
    conditions.push("p.category = ?");
    params.push(filters.category);
  }

  /* =========================
     BRAND
  ========================= */

  if (filters.brand) {
    conditions.push("p.brand = ?");
    params.push(filters.brand);
  }

  /* =========================
     SEARCH
  ========================= */

  if (filters.search) {
    conditions.push("p.name LIKE ?");
    params.push(`%${filters.search}%`);
  }

  const where =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const sql = `
    SELECT
      w.id,
      w.name,
      COUNT(DISTINCT wi.product_id) AS totalProducts,
      COALESCE(SUM(wi.quantity), 0) AS totalQuantity,
      COALESCE(
        SUM(
          wi.quantity * COALESCE(p.price, 0)
        ),
        0
      ) AS inventoryValue
    FROM warehouses w
    LEFT JOIN warehouse_inventory wi
      ON wi.warehouse_id = w.id
    LEFT JOIN products p
      ON p.id = wi.product_id
    ${where}
    GROUP BY
      w.id,
      w.name
    ORDER BY
      w.name;
  `;

  return await query(sql, params);
}

module.exports = {
  getWarehouseSummary,
};