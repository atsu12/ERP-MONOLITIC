const query = require("./query");

async function getFastMoving(filters = {}) {
  const sql = `
    SELECT
      p.id,
      p.name,
      SUM(sm.quantity) AS totalOut
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('OUT','SCANNED_OUT')
    GROUP BY p.id
    ORDER BY totalOut DESC
    LIMIT 10
  `;

  return await query(sql);
}

async function getSlowMoving(filters = {}) {
  const sql = `
    SELECT
      p.id,
      p.name,
      SUM(sm.quantity) AS totalOut
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.type IN ('OUT','SCANNED_OUT')
    GROUP BY p.id
    ORDER BY totalOut ASC
    LIMIT 10
  `;

  return await query(sql);
}

async function getRecentMovements(filters = {}) {
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
    ORDER BY sm.created_at DESC
    LIMIT 10
  `;

  return await query(sql);
}

module.exports = {
  getFastMoving,
  getSlowMoving,
  getRecentMovements,
};