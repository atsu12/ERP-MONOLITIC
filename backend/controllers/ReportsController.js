const db = require("../configs/db");

const reports = require("../services/reports");

/* =========================
   ALL MOVEMENTS
========================= */

exports.getMovements = (req, res) => {
  const q = `
    SELECT
      stock_movements.*,
      products.name AS product_name
    FROM stock_movements
    JOIN products
      ON products.id = stock_movements.product_id
    ORDER BY stock_movements.created_at DESC
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
    res.status(500).json({
      error: error.message,
    });
  }
};
