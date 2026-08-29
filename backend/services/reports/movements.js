const query = require("./query");
const { buildFilters } = require("./filters");

async function getFastMoving(filters = {}) {
  const { where, params } = buildFilters(filters, {
    product: "p",
    movement: "sm",
  });

  const sql = `
    SELECT
  p.id,
  p.name,
  SUM(
    CASE
      WHEN sm.type = 'STOCK_OUT' THEN sm.quantity
      WHEN sm.type = 'RETURNED' THEN -sm.quantity
      ELSE 0
    END
  ) AS totalOut
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('STOCK_OUT', 'RETURNED')
    ${where ? `AND ${where.replace(/^WHERE\s+/i, "")}` : ""}
    GROUP BY
      p.id,
      p.name
    ORDER BY totalOut DESC
    LIMIT 10
  `;

  return await query(sql, params);
}

async function getSlowMoving(filters = {}) {
  const { where, params } = buildFilters(filters, {
    product: "p",
    movement: "sm",
  });

  const movementFilters = where
    ? `AND ${where.replace(/^WHERE\s+/i, "")}`
    : "";

  const sql = `
    SELECT
      p.id,
      p.name,
      COALESCE(
        SUM(
          CASE
            WHEN sm.type = 'STOCK_OUT' THEN sm.quantity
            WHEN sm.type = 'RETURNED' THEN -sm.quantity
            ELSE 0
          END
        ),
        0
      ) AS totalOut
    FROM products p
    LEFT JOIN stock_movements sm
      ON sm.product_id = p.id
      ${movementFilters}
    GROUP BY
      p.id,
      p.name
    ORDER BY
      totalOut ASC,
      p.name ASC
    LIMIT 10
  `;

  return await query(sql, params);
}

async function getRecentMovements(filters = {}) {
  const { where, params } = buildFilters(filters, {
    product: "p",
    movement: "sm",
  });

  const sql = `
    SELECT
      sm.id,
      p.name AS product_name,
      sm.type,
      sm.quantity,
      sm.created_at
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('RECEIVED', 'STOCK_OUT', 'RETURNED', 'DAMAGED')
    ${where ? `AND ${where.replace(/^WHERE\s+/i, "")}` : ""}
    ORDER BY sm.created_at DESC
    LIMIT 10
  `;

  return await query(sql, params);
}

module.exports = {
  getFastMoving,
  getSlowMoving,
  getRecentMovements,
};
