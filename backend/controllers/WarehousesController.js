const db = require("../configs/db").promise();

/* =========================
   GET WAREHOUSES
========================= */

exports.getWarehouses = async (req, res) => {
  try {
    const [warehouses] = await db.query(`
      SELECT
    w.id,
    w.name,
    w.code,
    w.location,
    w.status,
    w.created_at,

    COUNT(wi.id) AS products,

    COALESCE(SUM(wi.quantity), 0) AS quantity

FROM warehouses w

LEFT JOIN warehouse_inventory wi
    ON wi.warehouse_id = w.id

GROUP BY
    w.id,
    w.name,
    w.code,
    w.location,
    w.status,
    w.created_at

ORDER BY w.name ASC
    `);

    res.json({
      warehouses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch warehouses",
    });
  }
};

/* =========================
   CREATE WAREHOUSE
========================= */

exports.createWarehouse = async (req, res) => {
  try {
    const { name, code, location } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Name and code are required",
      });
    }

    /* =========================
CHECK DUPLICATE NAME
========================= */

    const [existingWarehouse] = await db.query(
      `
  SELECT id
  FROM warehouses
  WHERE LOWER(name) = LOWER(?)
  LIMIT 1
  `,
      [name],
    );

    if (existingWarehouse.length > 0) {
      return res.status(400).json({
        message: "A warehouse with this name already exists",
      });
    }

    await db.query(
      `
      INSERT INTO warehouses (
        name,
        code,
        location
      )
      VALUES (?, ?, ?)
    `,
      [name, code, location || null],
    );

    res.status(201).json({
      message: "Warehouse created successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to create warehouse",
    });
  }
};

/* =========================
   UPDATE WAREHOUSE
========================= */

exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, code, location, status } = req.body;

    /* =========================
CHECK DUPLICATE NAME
========================= */

    const [existingWarehouse] = await db.query(
      `
  SELECT id
  FROM warehouses
  WHERE LOWER(name) = LOWER(?)
    AND id <> ?
  LIMIT 1
  `,
      [name, id],
    );

    if (existingWarehouse.length > 0) {
      return res.status(400).json({
        message: "A warehouse with this name already exists",
      });
    }

    /* =========================
CHECK DUPLICATE CODE
========================= */

    const [existingCode] = await db.query(
      `
  SELECT id
  FROM warehouses
  WHERE LOWER(code) = LOWER(?)
    AND id <> ?
  LIMIT 1
  `,
      [code, id],
    );

    if (existingCode.length > 0) {
      return res.status(400).json({
        message: "A warehouse with this code already exists",
      });
    }

    await db.query(
      `
      UPDATE warehouses
      SET
        name = ?,
        code = ?,
        location = ?,
        status = ?
      WHERE id = ?
    `,
      [name, code, location, status, id],
    );

    res.json({
      message: "Warehouse updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update warehouse",
    });
  }
};

/* =========================
   DELETE WAREHOUSE
========================= */

exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    /* =========================
         CHECK INVENTORY
       ========================= */

    const [inventory] = await db.query(
      `
  SELECT COUNT(*) AS total
  FROM warehouse_inventory
  WHERE warehouse_id = ?
  `,
      [id],
    );

    if (inventory[0].total > 0) {
      return res.status(400).json({
        message:
          "This warehouse still contains allocated inventory. Remove or transfer the inventory before deleting the warehouse.",
      });
    }

    await db.query(
      `
      DELETE FROM warehouses
      WHERE id = ?
    `,
      [id],
    );

    res.json({
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete warehouse",
    });
  }
};
