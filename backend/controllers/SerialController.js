const db =
  require('../configs/db');

const {
  getIO
} = require('../socket');

/* =========================
   REGISTER SERIAL
========================= */

exports.registerSerial = (
  req,
  res
) => {

  const {

    product_id,

    serial_number,

  } = req.body;

  // VALIDATION

  if (
    !product_id ||
    !serial_number
  ) {

    return res.status(400).json({

      error:
        'Product ID and serial number are required'

    });

  }

  // INSERT SERIAL

  const query = `
    INSERT INTO product_items
    (
      product_id,
      serial_number,
      status
    )
    VALUES (?, ?, 'IN_STOCK')
  `;

  db.query(
    query,
    [
      product_id,
      serial_number
    ],
    (
      err,
      result
    ) => {

      if (err) {

        // DUPLICATE SERIAL

        if (
          err.code ===
          'ER_DUP_ENTRY'
        ) {

          return res.status(400).json({

            error:
              'Serial number already exists'

          });

        }

        return res.status(500).json({
          error: err.message
        });

      }

      /* =========================
         REALTIME EVENT
      ========================= */

      getIO().emit(
        'product-updated'
      );

      res.json({

        message:
          'Serial registered successfully',

        id:
          result.insertId,

      });

    }
  );

};