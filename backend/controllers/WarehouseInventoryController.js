const db = require("../configs/db").promise();


/* =========================
GET WAREHOUSE INVENTORY
========================= */

exports.getWarehouseInventory = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        wi.id,
        wi.quantity,
        p.id AS product_id,
        p.name,
        p.brand,
        p.category,
        p.track_serial
      FROM warehouse_inventory wi
      JOIN products p
        ON p.id = wi.product_id
      WHERE wi.warehouse_id = ?
      ORDER BY p.name ASC
      `,
      [warehouseId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get Warehouse Inventory Error:", error);
    res.status(500).json({
      message: "Failed to fetch warehouse inventory",
    });
  }
};

/* =========================
ASSIGN INVENTORY
========================= */

exports.assignInventory = async (req, res) => {
  try {
    const { warehouse_id, product_id, quantity } = req.body;

    const assignQty = Number(quantity);

    if (!warehouse_id || !product_id) {
      return res.status(400).json({
        message: "Warehouse and product are required",
      });
    }

    if (!assignQty || assignQty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }

    /* =========================
       GET PRODUCT INVENTORY
    ========================= */

    const [productRows] = await db.query(
      `
      SELECT
        p.id,
        p.track_serial,

        CASE
          WHEN p.track_serial = TRUE
          THEN (
            SELECT COUNT(*)
            FROM product_items pi
            WHERE pi.product_id = p.id
            AND pi.status = 'IN_STOCK'
          )
          ELSE p.quantity
        END AS total_inventory

      FROM products p
      WHERE p.id = ?
      `,
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productRows[0];

    /* =========================
       ALREADY ALLOCATED
    ========================= */

    const [allocationRows] = await db.query(
      `
      SELECT
        COALESCE(SUM(quantity), 0) AS allocated
      FROM warehouse_inventory
      WHERE product_id = ?
      `,
      [product_id]
    );

    const allocated =
      Number(allocationRows[0].allocated) || 0;

    const available =
      Number(product.total_inventory) - allocated;

    if (assignQty > available) {
      return res.status(400).json({
        message: `Only ${available} available for allocation`,
      });
    }

    /* =========================
       UPSERT
    ========================= */

    await db.query(
      `
      INSERT INTO warehouse_inventory
      (
        warehouse_id,
        product_id,
        quantity
      )
      VALUES (?, ?, ?)

      ON DUPLICATE KEY UPDATE
      quantity = quantity + VALUES(quantity)
      `,
      [
        warehouse_id,
        product_id,
        assignQty,
      ]
    );

    res.json({
      message: "Inventory allocated successfully",
    });
  } catch (error) {
    console.error(
      "Assign Inventory Error:",
      error
    );

    res.status(500).json({
      message: "Failed to allocate inventory",
    });
  }
};

exports.updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const newQty = Number(quantity);

    if (newQty < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    if (newQty === 0) {
      await db.query(
        `
        DELETE FROM warehouse_inventory
        WHERE id = ?
        `,
        [id]
      );

      return res.json({
        message: "Allocation removed successfully",
      });
    }

    await db.query(
      `
      UPDATE warehouse_inventory
      SET quantity = ?
      WHERE id = ?
      `,
      [newQty, id]
    );

    res.json({
      message: "Allocation updated successfully",
    });
  } catch (error) {
    console.error("Update Allocation Error:", error);

    res.status(500).json({
      message: "Failed to update allocation",
    });
  }
};

/* =========================
DELETE ALLOCATION
========================= */

exports.deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM warehouse_inventory
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.json({
      message: "Allocation removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete Allocation Error:",
      error
    );

    res.status(500).json({
      message: "Failed to remove allocation",
    });
  }
};