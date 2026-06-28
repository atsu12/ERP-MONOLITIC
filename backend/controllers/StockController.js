const db =
  require('../configs/db');

const {
  getIO
} = require('../socket');

/* =========================
   STOCK IN
========================= */

exports.addStock = (
  req,
  res
) => {

  let {

    product_id,

    quantity,

    serials,

  } = req.body;

  quantity =
    Number(quantity) || 0;

  /* =========================
     VALIDATION
  ========================= */

  if (!product_id) {

    return res.status(400).json({
      error:
        'Product ID is required'
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

  db.query(
    productQuery,
    [product_id],
    (
      productErr,
      productResult
    ) => {

      if (productErr) {

        return res.status(500).json({
          error:
            productErr.message
        });

      }

      if (
        productResult.length === 0
      ) {

        return res.status(404).json({
          error:
            'Product not found'
        });

      }

      const product =
        productResult[0];

      /* =========================
         SERIALIZED PRODUCTS
      ========================= */

      if (
        product.track_serial
      ) {

        if (
          !Array.isArray(serials) ||
          serials.length === 0
        ) {

          return res.status(400).json({

            error:
              'Serialized products require serial numbers'

          });

        }

        const values =
          serials.map(
            (serial) => [

              product_id,

              serial.trim(),

              'IN_STOCK',

            ]
          );

        const serialQuery = `
          INSERT INTO product_items
          (
            product_id,
            serial_number,
            status
          )
          VALUES ?
        `;

        db.query(
          serialQuery,
          [values],
          (serialErr) => {

            if (serialErr) {

              if (
                serialErr.code ===
                'ER_DUP_ENTRY'
              ) {

                return res.status(400).json({

                  error:
                    'One or more serial numbers already exist'

                });

              }

              return res.status(500).json({
                error:
                  serialErr.message
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
              [
                product_id,
                serials.length
              ],
              (movementErr) => {

                if (movementErr) {

                  return res.status(500).json({
                    error:
                      movementErr.message
                  });

                }

                getIO().emit(
                  'product-updated'
                );

                return res.json({

                  message:
                    'Serialized stock added successfully'

                });

              }
            );

          }
        );

        return;

      }

      /* =========================
         STANDARD PRODUCTS
      ========================= */

      if (
        quantity <= 0
      ) {

        return res.status(400).json({

          error:
            'Quantity must be greater than zero'

        });

      }

      const stockQuery = `
        UPDATE products
        SET quantity =
          quantity + ?
        WHERE id = ?
      `;

      db.query(
        stockQuery,
        [
          quantity,
          product_id
        ],
        (stockErr) => {

          if (stockErr) {

            return res.status(500).json({
              error:
                stockErr.message
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
            [
              product_id,
              quantity
            ],
            (movementErr) => {

              if (movementErr) {

                return res.status(500).json({
                  error:
                    movementErr.message
                });

              }

              getIO().emit(
                'product-updated'
              );

              res.json({

                message:
                  'Stock added successfully'

              });

            }
          );

        }
      );

    }
  );

};

/* =========================
   STOCK OUT
========================= */

exports.removeStock = (
  req,
  res
) => {

  const {

    product_id,

    quantity,

  } = req.body;

  const query = `
    UPDATE products
    SET quantity =
      quantity - ?
    WHERE id = ?
    AND quantity >= ?
  `;

  db.query(
    query,
    [
      quantity,
      product_id,
      quantity
    ],
    (
      err,
      result
    ) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        });

      }

      if (
        result.affectedRows === 0
      ) {

        return res.status(400).json({

          error:
            'Insufficient stock'

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
        VALUES (?, 'SCANNED_OUT', ?)
      `;

      db.query(
        movementQuery,
        [
          product_id,
          quantity
        ],
        (movementErr) => {

          if (movementErr) {

            return res.status(500).json({
              error:
                movementErr.message
            });

          }

          getIO().emit(
            'product-updated'
          );

          res.json({

            message:
              'Stock removed successfully'

          });

        }
      );

    }
  );

};