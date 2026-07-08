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
      return res.status(500).json({
        error: err.message,
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
      return res.status(500).json({
        error: err.message,
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    db.query(serialsQuery, [productId], (err, serialsResult) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
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

  track_serial = Boolean(track_serial);
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
      return res.status(500).json({
        error: dupErr.message,
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
          return res.status(500).json({
            error: err.message,
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
      return res.status(500).json({
        error: dupErr.message,
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
          return res.status(500).json({
            error: err.message,
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
      return res.status(500).json({
        error: err.message,
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const productName = productResult[0].name;

    db.query(deleteItemsQuery, [productId], (err) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      db.query(deleteProductQuery, [productId], (err2) => {
        if (err2) {
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
  });
};/* =========================
DELETE PRODUCT
========================= */

exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  const productQuery = `
SELECT name
FROM products
WHERE id = ?
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
      return res.status(500).json({
        error: err.message,
      });
    }

    if (productResult.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const productName = productResult[0].name;

    db.query(deleteItemsQuery, [productId], (err) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      db.query(deleteProductQuery, [productId], (err2) => {
        if (err2) {
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
  });
};