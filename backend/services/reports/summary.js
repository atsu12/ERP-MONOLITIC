const query = require("./query");

const { buildFilters } = require("./filters");

async function getSummary(filters = {}) {
  const { where, params } = buildFilters(filters, {
    product: "p",
    movement: "sm",
  });

  const { where: productWhere, params: productParams } = buildFilters(filters, {
    product: "p",
  });

  const totalProductsQuery = `
  SELECT
    COUNT(*) AS totalProducts
  FROM products p
  ${productWhere}
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
${productWhere}
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
${productWhere}
`;

  const stockInQuery = `
  SELECT
    COALESCE(SUM(sm.quantity),0) AS stockIn
  FROM stock_movements sm
  JOIN products p
    ON p.id = sm.product_id
  WHERE sm.type IN ('IN','RECEIVED','SCANNED_IN')
  ${where ? `AND ${where.replace(/^WHERE\s+/i, "")}` : ""}
`;

  const stockOutQuery = `
  SELECT
    COALESCE(SUM(sm.quantity),0) AS stockOut
  FROM stock_movements sm
  JOIN products p
    ON p.id = sm.product_id
  WHERE sm.type IN ('OUT','SCANNED_OUT')
  ${where ? `AND ${where.replace(/^WHERE\s+/i, "")}` : ""}
`;
  const lowStockProductsQuery = `
  SELECT
    COUNT(*) AS lowStockProducts
  FROM products p
  ${productWhere}
  ${productWhere ? "AND" : "WHERE"}
    CASE
      WHEN p.track_serial = TRUE
      THEN (
        SELECT COUNT(*)
        FROM product_items pi
        WHERE pi.product_id = p.id
        AND pi.status = 'IN_STOCK'
      )
      ELSE p.quantity
    END <= 10
`;

  const [
    totalProducts,
    totalQuantity,
    inventoryValue,
    stockIn,
    stockOut,
    lowStockProducts,
  ] = await Promise.all([
    query(totalProductsQuery, productParams),
    query(totalQuantityQuery, productParams),
    query(inventoryValueQuery, productParams),
    query(stockInQuery, params),
    query(stockOutQuery, params),
    query(lowStockProductsQuery, productParams),
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
