function buildFilters(filters = {}, aliases = {}) {
  const where = [];
  const params = [];

  const product = aliases.product || "p";
  const movement = aliases.movement || "sm";
  const warehouse = aliases.warehouse || "w";

  /* =========================
     SEARCH
  ========================= */

  if (filters.search) {
    where.push(`
      (
        ${product}.name LIKE ?
      )
    `);

    params.push(`%${filters.search}%`);
  }

  /* =========================
     CATEGORY
  ========================= */

  if (filters.category) {
    where.push(`${product}.category = ?`);
    params.push(filters.category);
  }

  /* =========================
     BRAND
  ========================= */

  if (filters.brand) {
    where.push(`${product}.brand = ?`);
    params.push(filters.brand);
  }

  /* =========================
     PRODUCT TYPE
  ========================= */

  if (filters.productType && aliases.product) {
    if (filters.productType === "SERIALIZED") {
      where.push(`${product}.track_serial = TRUE`);
    }

    if (filters.productType === "STANDARD") {
      where.push(`${product}.track_serial = FALSE`);
    }
  }

  /* =========================
     LOW STOCK
  ========================= */

  if (filters.lowStock && aliases.product) {
    where.push(`${product}.quantity <= 10`);
  }

  /* =========================
     OUT OF STOCK
  ========================= */

  if (filters.outOfStock && aliases.product) {
    where.push(`${product}.quantity = 0`);
  }

  /* =========================
     WAREHOUSE
  ========================= */

  if (filters.warehouse) {
    where.push(`${warehouse}.id = ?`);
    params.push(filters.warehouse);
  }

  /* =========================
   MOVEMENT DATE FILTERS
  ========================= */

  if (aliases.movement) {
    if (filters.period) {
      where.push(`${movement}.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`);

      params.push(Number(filters.period));
    }

    if (filters.fromDate) {
      where.push(`${movement}.created_at >= ?`);
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      where.push(`${movement}.created_at <= ?`);
      params.push(filters.toDate);
    }
  }

  return {
    where: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

module.exports = {
  buildFilters,
};
