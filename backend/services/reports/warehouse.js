const query = require("./query");

async function getWarehouseSummary(filters = {}) {
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
    GROUP BY
      w.id,
      w.name
    ORDER BY
      w.name;
  `;

  return await query(sql);
}

module.exports = {
  getWarehouseSummary,
};