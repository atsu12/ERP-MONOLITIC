const query = require("./query");

async function getSummary(filters = {}) {
  const totalProductsQuery = `
    SELECT COUNT(*) AS totalProducts
    FROM products
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

  const [
    totalProducts,
    totalQuantity,
    inventoryValue,
    stockIn,
    stockOut,
    lowStockProducts,
  ] = await Promise.all([
    query(totalProductsQuery),
    query(totalQuantityQuery),
    query(inventoryValueQuery),
    query(stockInQuery),
    query(stockOutQuery),
    query(lowStockProductsQuery),
  ]);

  return {
    totalProducts: totalProducts[0].totalProducts || 0,

    totalQuantity: totalQuantity[0].totalQuantity || 0,

    inventoryValue: inventoryValue[0].inventoryValue || 0,

    stockIn: stockIn[0].stockIn || 0,

    stockOut: stockOut[0].stockOut || 0,

    lowStockProducts: lowStockProducts[0].lowStockProducts || 0,
  };
}

module.exports = {
  getSummary,
};