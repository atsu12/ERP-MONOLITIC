const query = require("./query");
const { buildFilters } = require("./filters");

async function getInventoryValuation(filters = {}) {
  const { where, params } = buildFilters(filters, {
    product: "p",
  });
  const sql = `
    SELECT
      p.id,
      p.name,
      p.brand,
      p.category,
      p.price,

      CASE
        WHEN p.track_serial = TRUE
        THEN (
          SELECT COUNT(*)
          FROM product_items pi
          WHERE pi.product_id = p.id
          AND pi.status = 'IN_STOCK'
        )
        ELSE p.quantity
      END AS quantity,

      (
        CASE
          WHEN p.track_serial = TRUE
          THEN (
            SELECT COUNT(*)
            FROM product_items pi
            WHERE pi.product_id = p.id
            AND pi.status = 'IN_STOCK'
          )
          ELSE p.quantity
        END
      ) * COALESCE(p.price, 0) AS inventoryValue

    FROM products p

${where}

ORDER BY inventoryValue DESC, p.name ASC;
  `;

  return await query(sql, params);
}

module.exports = {
  getInventoryValuation,
};
