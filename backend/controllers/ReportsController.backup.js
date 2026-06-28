const dashboardService = require("../services/reports/dashboardService");

const db = require("../configs/db");

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
    const totalProducts = await dashboardService.getTotalProducts();

    const totalWarehousesQuery = `
     SELECT COUNT(*) AS totalWarehouses
     FROM warehouses
`;

    const totalQuantityQuery = `
      SELECT
        SUM(
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
        ) AS totalQuantity
      FROM products p
    `;

    const inventoryValueQuery = `
      SELECT
        SUM(
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
          ) * COALESCE(p.price,0)
        ) AS inventoryValue
      FROM products p
    `;

    const stockInQuery = `
      SELECT
        COALESCE(SUM(quantity),0) AS stockIn
      FROM stock_movements
      WHERE type IN ('IN','RECEIVED','SCANNED_IN')
    `;

    const stockOutQuery = `
      SELECT
        COALESCE(SUM(quantity),0) AS stockOut
      FROM stock_movements
      WHERE type IN ('OUT','SCANNED_OUT')
    `;

    const lowStockProductsQuery = `
  SELECT COUNT(*) AS lowStockProducts
  FROM products
  WHERE quantity <= 10
`;

    const fastMovingProductsQuery = `
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

    const slowMovingProductsQuery = `
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

    const recentMovementsQuery = `
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

    try {
      if (err1) {
        return res.status(500).json({
          error: err1.message,
        });
      }

      db.query(totalWarehousesQuery, (errW, warehousesResult) => {
        if (errW) {
          return res.status(500).json({
            error: errW.message,
          });
        }

        db.query(totalQuantityQuery, (err2, quantityResult) => {
          if (err2) {
            return res.status(500).json({
              error: err2.message,
            });
          }

          db.query(inventoryValueQuery, (err3, valueResult) => {
            if (err3) {
              return res.status(500).json({
                error: err3.message,
              });
            }

            db.query(stockInQuery, (err4, stockInResult) => {
              if (err4) {
                return res.status(500).json({
                  error: err4.message,
                });
              }

              db.query(stockOutQuery, (err5, stockOutResult) => {
                if (err5) {
                  return res.status(500).json({
                    error: err5.message,
                  });
                }

                db.query(lowStockProductsQuery, (err6, lowStockResult) => {
                  if (err6) {
                    return res.status(500).json({
                      error: err6.message,
                    });
                  }

                  db.query(
                    fastMovingProductsQuery,
                    (err7, fastMovingProducts) => {
                      if (err7) {
                        return res.status(500).json({
                          error: err7.message,
                        });
                      }

                      db.query(
                        slowMovingProductsQuery,
                        (err8, slowMovingProducts) => {
                          if (err8) {
                            return res.status(500).json({
                              error: err8.message,
                            });
                          }

                          db.query(
                            recentMovementsQuery,
                            (err9, recentMovements) => {
                              if (err9) {
                                return res.status(500).json({
                                  error: err9.message,
                                });
                              }

                              res.json({
                                totalProducts: productsResult[0].totalProducts,

                                totalWarehouses:
                                  warehousesResult[0].totalWarehouses,

                                totalQuantity:
                                  quantityResult[0].totalQuantity || 0,

                                inventoryValue:
                                  valueResult[0].inventoryValue || 0,

                                stockIn: stockInResult[0].stockIn || 0,

                                stockOut: stockOutResult[0].stockOut || 0,

                                lowStockProducts:
                                  lowStockResult[0].lowStockProducts || 0,

                                fastMovingProducts,

                                slowMovingProducts,

                                recentMovements,
                              });
                            },
                          );
                        },
                      );
                    },
                  );
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
