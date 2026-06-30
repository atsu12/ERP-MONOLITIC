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
      SUM(sm.quantity) AS totalOut
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('OUT','SCANNED_OUT')
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

  const sql = `
    SELECT
      p.id,
      p.name,
      SUM(sm.quantity) AS totalOut
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('OUT','SCANNED_OUT')
    ${where ? `AND ${where.replace(/^WHERE\s+/i, "")}` : ""}
    GROUP BY
      p.id,
      p.name
    ORDER BY totalOut ASC
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
    ${where}
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