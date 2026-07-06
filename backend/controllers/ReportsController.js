const db = require("../configs/db");

const reports = require("../services/reports");

const logger = require("../utils/logger");

/* =========================
   ALL MOVEMENTS
========================= */

exports.getMovements = (req, res) => {
  const q = `
  SELECT
    sm.id,
    sm.product_id,
    p.name AS product_name,
    sm.serial_number,
    sm.type,
    sm.quantity,
    sm.reference,
    sm.created_at,
    sm.updated_at,
    sm.user_id,
    u.username
  FROM stock_movements sm
  JOIN products p
    ON p.id = sm.product_id
  LEFT JOIN users u
    ON u.id = sm.user_id
  ORDER BY sm.created_at DESC
`;

  db.query(q, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json({
      movements: results,
    });
  });
};

/* =========================
   PRODUCT MOVEMENTS
========================= */

exports.getProductMovements = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT
      stock_movements.*
    FROM stock_movements
    WHERE product_id = ?
    ORDER BY created_at DESC
  `;

  db.query(q, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json({
      movements: results,
    });
  });
};

/* =========================
DASHBOARD REPORT
========================= */

exports.getDashboardReport = async (req, res) => {
  try {
    const dashboard = await reports.getDashboard(req.query);

    res.json(dashboard);
  } catch (error) {
  logger.error(error);

  res.status(500).json({
    error: error.message,
  });
}
};

/* =========================
WAREHOUSE REPORT
========================= */

exports.getWarehouseReport = async (req, res) => {
  try {
    const data = await reports.getWarehouseSummary(req.query);

    res.json(data);
  } catch (error) {
  logger.error(error);

  res.status(500).json({
    error: error.message,
  });
}
};

/* =========================
INVENTORY VALUATION
========================= */

exports.getInventoryValuation = async (req, res) => {
  try {
    const inventory = await reports.getInventoryValuation(req.query);

    res.json(inventory);
  } catch (error) {
  logger.error(error);

  res.status(500).json({
    error: error.message,
  });
}
};
