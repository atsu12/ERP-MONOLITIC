const db = require("../configs/db");

const { getIO } = require("../socket");

const logActivity = require("../utils/logActivity");

/* =========================
   STOCK IN
========================= */

exports.addStock = (req, res) => {
  let {
    product_id,
    quantity,
    serials,
    track_serial,
    stock_unit,
    package_size,
  } = req.body;

  quantity = Number(quantity) || 0;

  /* =========================
     VALIDATION
  ========================= */

  if (!product_id) {
    return res.status(400).json({
      error: "Product ID is required",
    });
  }

  /* =========================
     GET PRODUCT
  ========================= */

  const productQuery = `
    SELECT
      id,
      name,
      track_serial
    FROM products
    WHERE id = ?
  `;

  db.query(productQuery, [product_id], (productErr, productResult) => {
    if (productErr) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const product = productResult[0];

    /* =========================
   INVENTORY TYPE PROTECTION
========================= */

    const requestedSerialized =
      track_serial === true || track_serial === "true";

    if (
      product.track_serial !== null &&
      Boolean(product.track_serial) !== requestedSerialized
    ) {
      return res.status(400).json({
        error: `This product is already established as ${
          product.track_serial ? "Serialized" : "Standard"
        } and cannot be stocked as ${
          requestedSerialized ? "Serialized" : "Standard"
        }.`,
      });
    }

    /* =========================
     SERIALIZED PRODUCTS
  ========================= */

    if (track_serial === true || track_serial === "true") {
      if (!Array.isArray(serials) || serials.length === 0) {
        return res.status(400).json({
          error: "Serialized products require serial numbers",
        });
      }

      const values = serials.map((serial) => [
        product_id,
        serial.trim(),
        "IN_STOCK",
      ]);

      const serialQuery = `
      INSERT INTO product_items
      (
        product_id,
        serial_number,
        status
      )
      VALUES ?
    `;

      db.query(serialQuery, [values], (serialErr) => {
        if (serialErr) {
          if (serialErr.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "One or more serial numbers already exist",
            });
          }

          return res.status(500).json({
            error: "Internal server error",
          });
        }

        /* =========================
         ESTABLISH SERIALIZED TYPE
      ========================= */

        const typeQuery = `
      UPDATE products
      SET track_serial = TRUE
      WHERE id = ?
    `;

        db.query(typeQuery, [product_id], (typeErr) => {
          if (typeErr) {
            return res.status(500).json({
              error: "Internal server error",
            });
          }

          /* =========================
           MOVEMENT LOG
        ========================= */

          const movementQuery = `
          INSERT INTO stock_movements
          (
            product_id,
            type,
            quantity
          )
          VALUES (?, 'RECEIVED', ?)
        `;

          db.query(
            movementQuery,
            [product_id, serials.length],
            (movementErr) => {
              if (movementErr) {
                return res.status(500).json({
                  error: "Internal server error",
                });
              }

              getIO().emit("product-updated");

              logActivity(
                req.user.id,
                req.user.username,
                `Received stock: ${product.name} (${serials.length})`,
              );

              return res.json({
                message: "Serialized stock added successfully",
              });
            },
          );
        });
      });

      return;
    }

    /* =========================
         STANDARD PRODUCTS
      ========================= */

    if (quantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be greater than zero",
      });
    }

    const stockQuery = `
      UPDATE products
      SET
        track_serial = FALSE,
        quantity = quantity + ?,
        stock_unit = ?,
        package_size = ?
      WHERE id = ?
  `;

    db.query(
      stockQuery,
      [quantity, stock_unit || "Unit", Number(package_size) || 1, product_id],
      (stockErr) => {
        if (stockErr) {
          return res.status(500).json({
            error: "Internal server error",
          });
        }

        /* =========================
             MOVEMENT LOG
          ========================= */

        const movementQuery = `
            INSERT INTO stock_movements
            (
              product_id,
              type,
              quantity
            )
            VALUES (?, 'RECEIVED', ?)
          `;

        db.query(movementQuery, [product_id, quantity], (movementErr) => {
          if (movementErr) {
            return res.status(500).json({
              error: "Internal server error",
            });
          }

          getIO().emit("product-updated");

          logActivity(
            req.user.id,
            req.user.username,
            `Received stock: ${product.name} (${quantity})`,
          );

          return res.json({
            message: "Stock added successfully",
          });
        });
      },
    );
  });
};

/* =========================
   STOCK OUT
========================= */

exports.removeStock = (req, res) => {
  const productQuery = `
SELECT
  name
FROM products
WHERE id = ?
`;

  let {
    product_id,

    quantity,
  } = req.body;

  quantity = Number(quantity) || 0;

  if (quantity <= 0) {
    return res.status(400).json({
      error: "Quantity must be greater than zero",
    });
  }

  const query = `
    UPDATE products
    SET quantity =
      quantity - ?
    WHERE id = ?
    AND quantity >= ?
  `;

  db.query(productQuery, [product_id], (productErr, productResult) => {
    if (productErr) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const product = productResult[0];

    db.query(query, [quantity, product_id, quantity], (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Internal server error",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          error: "Insufficient stock",
        });
      }

      /* =========================
         MOVEMENT LOG
      ========================= */

      const movementQuery = `
        INSERT INTO stock_movements
        (
          product_id,
          type,
          quantity
        )
        VALUES (?, 'STOCK_OUT', ?)
      `;

      db.query(movementQuery, [product_id, quantity], (movementErr) => {
        if (movementErr) {
          return res.status(500).json({
            error: "Internal server error",
          });
        }

        getIO().emit("product-updated");

        logActivity(
          req.user.id,
          req.user.username,
          `Removed stock: ${product.name} (${quantity})`,
        );

        return res.json({
          message: "Stock removed successfully",
        });
      });
    });
  });
};
