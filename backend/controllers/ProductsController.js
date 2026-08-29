const logger = require("../utils/logger");

const db = require("../configs/db");

const { getIO } = require("../socket");

const logActivity = require("../utils/logActivity");

/* =========================
GET PRODUCTS
========================= */

exports.getProducts = (req, res) => {
  const search = req.query.search?.trim();

  let query = `
SELECT
p.id,
p.name,
p.brand,
p.category,
p.price,
p.track_serial,
p.stock_unit,
p.package_size,

CASE
WHEN p.track_serial = TRUE
THEN COUNT(DISTINCT pi.id)
ELSE p.quantity
END AS quantity

FROM products p

LEFT JOIN product_items pi
ON p.id = pi.product_id
AND pi.status = 'IN_STOCK'
`;

  const params = [];

  if (search) {
    query += `
WHERE
LOWER(p.name) LIKE ?
OR LOWER(p.brand) LIKE ?
OR LOWER(COALESCE(p.category, '')) LIKE ?
OR EXISTS (
  SELECT 1
  FROM product_items spi
  WHERE spi.product_id = p.id
  AND LOWER(spi.serial_number) LIKE ?
)
`;

    const term = `%${search.toLowerCase()}%`;

    params.push(term, term, term, term);
  }

  query += `
GROUP BY p.id
`;

  db.query(query, params, (err, results) => {
    if (err) {
      logger.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    res.json({
      products: results,
    });
  });
};

/* =========================
GET SINGLE PRODUCT
========================= */

exports.getProductById = (req, res) => {
  const productId = req.params.id;

  const productQuery = `
SELECT
p.*,

CASE
WHEN p.track_serial = TRUE
THEN COUNT(DISTINCT pi.id)
ELSE p.quantity
END AS quantity

FROM products p

LEFT JOIN product_items pi
ON p.id = pi.product_id
AND pi.status = 'IN_STOCK'

WHERE p.id = ?

GROUP BY p.id
`;

  const serialsQuery = `
SELECT
id,
serial_number,
status,
location
FROM product_items
WHERE product_id = ?
`;

  db.query(productQuery, [productId], (err, productResult) => {
    if (err) {
      logger.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    db.query(serialsQuery, [productId], (err, serialsResult) => {
      if (err) {
        logger.error(err);

        return res.status(500).json({
          error: "Internal server error",
        });
      }

      res.json({
        ...productResult[0],

        serials: serialsResult,
      });
    });
  });
};

/* =========================
CREATE PRODUCT
========================= */

exports.createProduct = (req, res) => {
  let {
    name,
    brand,
    category,
    price,
    track_serial,
    quantity,
    serials,
    stock_unit,
    package_size,
  } = req.body;

  /* =========================
VALIDATION
========================= */

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: "Product name is required",
    });
  }

  if (!brand || !brand.trim()) {
    return res.status(400).json({
      error: "Brand is required",
    });
  }

  /* =========================
NORMALIZE
========================= */

  name = name.trim();

  brand = brand.trim();

  category = category?.trim() || null;

  price =
    price === null || price === undefined || price === ""
      ? null
      : Number(price);

  quantity = Number(quantity) || 0;

  track_serial =
    track_serial === undefined || track_serial === null
      ? null
      : Boolean(track_serial);
  stock_unit = stock_unit?.trim() || "Unit";

  package_size = Number(package_size) || 1;

  /* =========================
NUMERIC VALIDATION
========================= */

  if (price !== null && price < 0) {
    return res.status(400).json({
      error: "Price cannot be negative",
    });
  }

  if (quantity < 0) {
    return res.status(400).json({
      error: "Quantity cannot be negative",
    });
  }

  /* =========================
SERIALIZED PRODUCTS
========================= */

  if (track_serial) {
    quantity = 0;

    stock_unit = "Unit";

    package_size = 1;
  }

  /* =========================
DUPLICATE CHECK
========================= */

  const duplicateQuery = `
SELECT id
FROM products
WHERE LOWER(name) = LOWER(?)
AND LOWER(brand) = LOWER(?)
`;

  db.query(duplicateQuery, [name, brand], (dupErr, dupResult) => {
    if (dupErr) {
      logger.error(dupErr);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (dupResult.length > 0) {
      return res.status(409).json({
        error: "Product already exists",
      });
    }

    /* =========================
INSERT PRODUCT
========================= */

    const productQuery = `
INSERT INTO products
(
name,
brand,
category,
price,
track_serial,
quantity,
stock_unit,
package_size
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

    db.query(
      productQuery,
      [
        name,
        brand,
        category,
        price,
        track_serial,
        quantity,
        stock_unit,
        package_size,
      ],
      (err, result) => {
        if (err) {
          logger.error(err);

          return res.status(500).json({
            error: "Internal server error",
          });
        }

        const productId = result.insertId;

        /* =========================
NON SERIALIZED
========================= */

        /* =========================
STANDARD PRODUCT
========================= */

        if (!track_serial) {
          getIO().emit("product-created");

          logActivity(
            req.user.id,
            req.user.username,
            `Created product: ${name}`,
          );

          return res.json({
            message: "Product created",
            id: productId,
          });
        }

        /* =========================
SERIALIZED PRODUCT
WITHOUT SERIALS
========================= */

        if (!Array.isArray(serials) || serials.length === 0) {
          getIO().emit("product-created");

          logActivity(
            req.user.id,
            req.user.username,
            `Created serialized product: ${name}`,
          );

          return res.json({
            message: "Serialized product created",
            id: productId,
          });
        }

        /* =========================
SERIALIZED PRODUCTS
========================= */

        const values = serials.map((serial) => [productId, serial, "IN_STOCK"]);

        const serialQuery = `
INSERT INTO product_items
(
product_id,
serial_number,
status
)
VALUES ?
`;

        db.query(serialQuery, [values], (err2) => {
          if (err2) {
            if (err2.code === "ER_DUP_ENTRY") {
              return res.status(400).json({
                error: "One or more serial numbers already exist",
              });
            }

            return res.status(500).json({
              error: err2.message,
            });
          }

          getIO().emit("product-created");

          logActivity(
            req.user.id,
            req.user.username,
            `Created serialized product: ${name}`,
          );

          return res.json({
            message: "Serialized product created",

            id: productId,
          });
        });
      },
    );
  });
};

/* =========================
UPDATE PRODUCT
========================= */

exports.updateProduct = (req, res) => {
  const productId = req.params.id;

  let { name, brand, category, price, stock_unit, package_size } = req.body;

  /* =========================
VALIDATION
========================= */

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: "Product name is required",
    });
  }

  if (!brand || !brand.trim()) {
    return res.status(400).json({
      error: "Brand is required",
    });
  }

  /* =========================
NORMALIZE
========================= */

  name = name.trim();

  brand = brand.trim();

  category = category?.trim() || null;

  stock_unit = stock_unit?.trim() || "Unit";

  package_size = Number(package_size) || 1;

  price =
    price === null || price === undefined || price === ""
      ? null
      : Number(price);

  /* =========================
NUMERIC VALIDATION
========================= */

  if (price !== null && price < 0) {
    return res.status(400).json({
      error: "Price cannot be negative",
    });
  }

  /* =========================
DUPLICATE CHECK
========================= */

  const duplicateQuery = `
SELECT id
FROM products
WHERE LOWER(name) = LOWER(?)
AND LOWER(brand) = LOWER(?)
AND id != ?
`;

  db.query(duplicateQuery, [name, brand, productId], (dupErr, dupResult) => {
    if (dupErr) {
      logger.error(dupErr);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (dupResult.length > 0) {
      return res.status(409).json({
        error: "Another product already exists with same name and brand",
      });
    }

    /* =========================
UPDATE PRODUCT
========================= */

    const updateQuery = `
UPDATE products
SET
name = ?,
brand = ?,
category = ?,
price = ?,
stock_unit = ?,
package_size = ?
WHERE id = ?
`;

    db.query(
      updateQuery,
      [name, brand, category, price, stock_unit, package_size, productId],
      (err, result) => {
        if (err) {
          logger.error(err);

          return res.status(500).json({
            error: "Internal server error",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Product not found",
          });
        }

        getIO().emit("product-updated");

        logActivity(req.user.id, req.user.username, `Updated product: ${name}`);

        res.json({
          message: "Product updated successfully",
        });
      },
    );
  });
};

/* =========================
DELETE PRODUCT
========================= */

exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  const productQuery = `
    SELECT name
    FROM products
    WHERE id = ?
  `;

  const movementQuery = `
    SELECT COUNT(*) AS total
    FROM stock_movements
    WHERE product_id = ?
  `;

  const warehouseQuery = `
    SELECT COUNT(*) AS total
    FROM warehouse_inventory
    WHERE product_id = ?
  `;

  const serializedQuery = `
    SELECT COUNT(*) AS total
    FROM product_items
    WHERE product_id = ?
  `;

  const deleteItemsQuery = `
    DELETE
    FROM product_items
    WHERE product_id = ?
  `;

  const deleteProductQuery = `
    DELETE
    FROM products
    WHERE id = ?
  `;

  db.query(productQuery, [productId], (err, productResult) => {
    if (err) {
      logger.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const productName = productResult[0].name;

    db.query(movementQuery, [productId], (movementErr, movementResult) => {
      if (movementErr) {
        logger.error(movementErr);

        return res.status(500).json({
          error: "Internal server error",
        });
      }

      db.query(warehouseQuery, [productId], (warehouseErr, warehouseResult) => {
        if (warehouseErr) {
          logger.error(warehouseErr);

          return res.status(500).json({
            error: "Internal server error",
          });
        }

        db.query(
          serializedQuery,
          [productId],
          (serializedErr, serializedResult) => {
            if (serializedErr) {
              logger.error(serializedErr);

              return res.status(500).json({
                error: "Internal server error",
              });
            }

            const hasMovements = movementResult[0].total > 0;

            const hasWarehouseInventory = warehouseResult[0].total > 0;

            const hasSerializedItems = serializedResult[0].total > 0;

            if (hasMovements || hasWarehouseInventory || hasSerializedItems) {
              return res.status(400).json({
                error:
                  "This product cannot be deleted because it has inventory history or warehouse allocations.",
              });
            }

            db.query(deleteItemsQuery, [productId], (err) => {
              if (err) {
                logger.error(err);

                return res.status(500).json({
                  error: "Internal server error",
                });
              }

              db.query(deleteProductQuery, [productId], (err2) => {
                if (err2) {
                  logger.error(err2);

                  return res.status(500).json({
                    error: err2.message,
                  });
                }
                getIO().emit("product-deleted");

                logActivity(
                  req.user.id,
                  req.user.username,
                  `Deleted product: ${productName}`,
                );

                res.json({
                  message: "Product deleted successfully",
                });
              });
            });
          },
        );
      });
    });
  });
};

/* =========================
   BULK PRODUCT IMPORT
========================= */

exports.importProducts = (req, res) => {
  const products = req.body.products;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: "No products supplied for import",
    });
  }

  const errors = [];
  const names = new Map();

  /* =========================
     VALIDATE ENTIRE BATCH
  ========================= */

  products.forEach((product, index) => {
    const row = index + 1;

    const name = String(product.name || "").trim();
    const brand = String(product.brand || "").trim();
    const category = String(product.category || "").trim();
    const price = Number(product.price);

    if (!name) {
      errors.push(`Row ${row}: Product name is empty.`);
    }

    if (!brand) {
      errors.push(`Row ${row}: Brand is empty.`);
    }

    if (!category) {
      errors.push(`Row ${row}: Category is empty.`);
    }

    if (!Number.isFinite(price)) {
      errors.push(`Row ${row}: Price is invalid.`);
    } else if (price <= 0) {
      errors.push(`Row ${row}: Price must be greater than 0.`);
    }

    const normalizedName = name.toLowerCase();

    if (normalizedName) {
      if (names.has(normalizedName)) {
        errors.push(
          `Row ${row}: Duplicate product "${name}" also appears on row ${names.get(normalizedName)}.`,
        );
      } else {
        names.set(normalizedName, row);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Import aborted",
      errors,
    });
  }

  /* =========================
     TRANSACTION
  ========================= */

  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      logger.error(connectionErr);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        connection.release();

        logger.error(transactionErr);

        return res.status(500).json({
          error: "Internal server error",
        });
      }

      const namesArray = products.map((product) => String(product.name).trim());

      const duplicateQuery = `
        SELECT name
        FROM products
        WHERE LOWER(name) IN (
          ${namesArray.map(() => "LOWER(?)").join(",")}
        )
      `;

      connection.query(
        duplicateQuery,
        namesArray,
        (duplicateErr, duplicateResults) => {
          if (duplicateErr) {
            return connection.rollback(() => {
              connection.release();

              logger.error(duplicateErr);

              return res.status(500).json({
                error: "Internal server error",
              });
            });
          }

          if (duplicateResults.length > 0) {
            const duplicateNames = duplicateResults.map(
              (product) => product.name,
            );

            return connection.rollback(() => {
              connection.release();

              return res.status(409).json({
                error: "Import aborted",
                errors: duplicateNames.map(
                  (name) => `Product "${name}" already exists in the system.`,
                ),
              });
            });
          }

          const insertQuery = `
            INSERT INTO products
            (
              name,
              brand,
              category,
              price,
              track_serial,
              quantity,
              stock_unit,
              package_size
            )
            VALUES ?
          `;

          const values = products.map((product) => [
            String(product.name).trim(),
            String(product.brand).trim(),
            String(product.category).trim(),
            Number(product.price),

            // Bulk import creates neutral product definitions.
            null,

            // NEVER create stock during product import.
            0,

            "Unit",
            1,
          ]);

          connection.query(insertQuery, [values], (insertErr, result) => {
            if (insertErr) {
              return connection.rollback(() => {
                connection.release();

                logger.error(insertErr);

                return res.status(500).json({
                  error: "Import aborted",
                  errors: [
                    "The products could not be imported. No products were created.",
                  ],
                });
              });
            }

            connection.commit((commitErr) => {
              if (commitErr) {
                return connection.rollback(() => {
                  connection.release();

                  logger.error(commitErr);

                  return res.status(500).json({
                    error: "Import aborted",
                    errors: [
                      "The import transaction failed. No products were created.",
                    ],
                  });
                });
              }

              connection.release();

              getIO().emit("product-created");

              logActivity(
                req.user.id,
                req.user.username,
                `Bulk imported ${result.affectedRows} products`,
              );

              return res.json({
                message: "Products imported successfully",
                imported: result.affectedRows,
              });
            });
          });
        },
      );
    });
  });
};
