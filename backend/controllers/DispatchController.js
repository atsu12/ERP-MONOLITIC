const db = require("../configs/db");

const { getIO } = require("../socket");

const logActivity = require("../utils/logActivity");

const { createMovement } = require("./MovementController");

/* =========================
   CREATE DISPATCH
========================= */

exports.createDispatch = (req, res) => {
  const {
    customer_name,

    contact,

    contact_person,

    location,

    items = [],

    serials = [],
  } = req.body;

  /* =========================
     VALIDATION
  ========================= */

  if (!customer_name?.trim()) {
    return res.status(400).json({
      error: "Customer name is required",
    });
  }

  if (!Array.isArray(items) && !Array.isArray(serials)) {
    return res.status(400).json({
      error: "Products are required",
    });
  }

  if (items.length === 0 && serials.length === 0) {
    return res.status(400).json({
      error: "At least one product is required",
    });
  }

  const reference = `DISP-${Date.now()}`;

  const productIds = items.map((item) => item.product_id);

  if (productIds.length === 0) {
    return res.status(400).json({
      error: "No products selected",
    });
  }

  const productsQuery = `
  SELECT
    id,
    name,
    price
  FROM products
  WHERE id IN (?)
`;

  db.query(productsQuery, [productIds], (productsErr, products) => {
    if (productsErr) {
      return res.status(500).json({
        error: productsErr.message,
      });
    }

    let subtotal = 0;

    const dispatchItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const unitPrice = Number(product.price || 0);

      const lineTotal = unitPrice * Number(item.quantity);

      subtotal += lineTotal;

      return {
        product_id: item.product_id,

        quantity: Number(item.quantity),

        unit_price: unitPrice,

        line_total: lineTotal,
      };
    });

    const grandTotal = subtotal;

    const transactionQuery = `
  INSERT INTO dispatch_transactions (
    reference,

    customer_name,
    contact,
    contact_person,
    location,

    status,

    subtotal,
    discount,
    grand_total,

    staff_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    db.query(
      transactionQuery,
      [
        reference,

        customer_name.trim(),
        contact || null,
        contact_person || null,
        location || null,

        "PENDING_PAYMENT",

        subtotal,
        0,
        grandTotal,

        req.user.id,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
          });
        }

        const dispatchId = result.insertId;

        const serialNumbers = serials.map((serial) => serial.serial_number);

        const itemValues = dispatchItems.map((item) => [
          dispatchId,

          item.product_id,

          item.quantity,

          item.unit_price,

          item.line_total,
        ]);

        const itemsQuery = `
    INSERT INTO dispatch_items (
      transaction_id,

      product_id,

      quantity,

      unit_price,

      line_total
    )
    VALUES ?
  `;

        db.query(itemsQuery, [itemValues], (itemsErr) => {
          if (itemsErr) {
            return res.status(500).json({
              error: itemsErr.message,
            });
          }

          if (serialNumbers.length === 0) {
            logActivity(
              req.user.id,
              req.user.username,
              `Created dispatch ${reference}`,
            );

            return res.status(201).json({
              message: "Dispatch created successfully",

              dispatch_id: dispatchId,

              reference,
            });
          }

          const serialQuery = `
    SELECT
      id
    FROM product_items
    WHERE serial_number IN (?)
  `;

          db.query(serialQuery, [serialNumbers], (serialErr, productItems) => {
            if (serialErr) {
              return res.status(500).json({
                error: serialErr.message,
              });
            }

            const serialValues = productItems.map((productItem) => [
              dispatchId,
              productItem.id,
            ]);

            const dispatchSerialQuery = `
        INSERT INTO dispatch_serials (
          transaction_id,
          product_item_id
        )
        VALUES ?
      `;

            db.query(
              dispatchSerialQuery,
              [serialValues],
              (dispatchSerialErr) => {
                if (dispatchSerialErr) {
                  return res.status(500).json({
                    error: dispatchSerialErr.message,
                  });
                }

                logActivity(
                  req.user.id,
                  req.user.username,
                  `Created dispatch ${reference}`,
                );

                return res.status(201).json({
                  message: "Dispatch created successfully",

                  dispatch_id: dispatchId,

                  reference,
                });
              },
            );
          });
        });
      },
    );
  });
};

/* =========================
   GET PENDING DISPATCHES
========================= */

exports.getPendingDispatches = (req, res) => {
  const query = `
    SELECT
      dt.id,
      dt.reference,
      dt.customer_name,
      dt.contact,
      dt.contact_person,
      dt.location,
      dt.subtotal,
      dt.grand_total,
      dt.status,
      dt.created_at,

      u.username AS staff_name

    FROM dispatch_transactions dt

    JOIN users u
      ON u.id = dt.staff_id

    WHERE dt.status = 'PENDING_PAYMENT'

    ORDER BY dt.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    return res.json({
      dispatches: results,
    });
  });
};

/* =========================
   GET DISPATCH DETAILS
========================= */

exports.getDispatchById = (req, res) => {};

/* =========================
   CONFIRM PAYMENT
========================= */

exports.confirmPayment = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE dispatch_transactions
    SET
      status = 'PAYMENT_CONFIRMED',

      cashier_id = ?,

      payment_confirmed_at = NOW()

    WHERE id = ?

    AND status = 'PENDING_PAYMENT'
  `;

  db.query(query, [req.user.id, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: "Dispatch not found or already processed",
      });
    }

    logActivity(
      req.user.id,
      req.user.username,
      `Confirmed payment for dispatch #${id}`,
    );

    return res.json({
      message: "Payment confirmed successfully",
    });
  });
};
/* =========================
   REMOVE STOCK
========================= */

exports.completeDispatch = (req, res) => {
  const { id } = req.params;

  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      return res.status(500).json({
        error: connectionErr.message,
      });
    }

    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        connection.release();

        return res.status(500).json({
          error: transactionErr.message,
        });
      }

      const dispatchQuery = `
        SELECT
          id,
          reference,
          status
        FROM dispatch_transactions
        WHERE id = ?
        FOR UPDATE
      `;

      connection.query(dispatchQuery, [id], (dispatchErr, dispatchRows) => {
        if (dispatchErr) {
          return connection.rollback(() => {
            connection.release();

            res.status(500).json({
              error: dispatchErr.message,
            });
          });
        }

        if (dispatchRows.length === 0) {
          return connection.rollback(() => {
            connection.release();

            res.status(404).json({
              error: "Dispatch not found",
            });
          });
        }

        const dispatch = dispatchRows[0];

        if (dispatch.status !== "PAYMENT_CONFIRMED") {
          return connection.rollback(() => {
            connection.release();

            res.status(400).json({
              error: "Dispatch has not been paid",
            });
          });
        }

        const itemsQuery = `
  SELECT
    di.id,
    di.product_id,
    di.quantity,

    p.track_serial

  FROM dispatch_items di

  JOIN products p
    ON p.id = di.product_id

  WHERE di.transaction_id = ?
`;

        connection.query(itemsQuery, [id], (itemsErr, dispatchItems) => {
          if (itemsErr) {
            return connection.rollback(() => {
              connection.release();

              res.status(500).json({
                error: itemsErr.message,
              });
            });
          }

          if (dispatchItems.length === 0) {
            return connection.rollback(() => {
              connection.release();

              res.status(400).json({
                error: "Dispatch contains no items",
              });
            });
          }

          const serialsQuery = `
      SELECT
        ds.product_item_id,

        pi.product_id,
        pi.serial_number

      FROM dispatch_serials ds

      JOIN product_items pi
        ON pi.id = ds.product_item_id

      WHERE ds.transaction_id = ?
    `;

          connection.query(
            serialsQuery,
            [id],
            (serialsErr, dispatchSerials) => {
              if (serialsErr) {
                return connection.rollback(() => {
                  connection.release();

                  res.status(500).json({
                    error: serialsErr.message,
                  });
                });
              }

              const standardItems = dispatchItems.filter(
                (item) => !item.track_serial,
              );

              const serializedItems = dispatchItems.filter(
                (item) => item.track_serial,
              );

              /* =========================
   REMOVE STANDARD STOCK
========================= */

              const removeStandardProducts = (index = 0) => {
                if (index >= standardItems.length) {
                  return removeSerializedProducts();
                }

                const item = standardItems[index];

                const updateQuery = `
    UPDATE products
    SET quantity = quantity - ?
    WHERE id = ?
    AND quantity >= ?
  `;

                connection.query(
                  updateQuery,
                  [item.quantity, item.product_id, item.quantity],
                  (updateErr, result) => {
                    if (updateErr) {
                      return connection.rollback(() => {
                        connection.release();

                        res.status(500).json({
                          error: updateErr.message,
                        });
                      });
                    }

                    if (result.affectedRows === 0) {
                      return connection.rollback(() => {
                        connection.release();

                        res.status(400).json({
                          error: "Insufficient stock",
                        });
                      });
                    }

                    removeStandardProducts(index + 1);
                  },
                );
              };

              /* =========================
   REMOVE SERIALIZED STOCK
========================= */

              const removeSerializedProducts = (index = 0) => {
                if (index >= dispatchSerials.length) {
                  return finalizeDispatch();
                }

                const serial = dispatchSerials[index];

                const serialUpdateQuery = `
    UPDATE product_items
    SET status = 'OUT'
    WHERE id = ?
    AND status = 'IN_STOCK'
  `;

                connection.query(
                  serialUpdateQuery,
                  [serial.product_item_id],
                  (serialUpdateErr, result) => {
                    if (serialUpdateErr) {
                      return connection.rollback(() => {
                        connection.release();

                        res.status(500).json({
                          error: serialUpdateErr.message,
                        });
                      });
                    }

                    if (result.affectedRows === 0) {
                      return connection.rollback(() => {
                        connection.release();

                        res.status(400).json({
                          error: `Serial ${serial.serial_number} is unavailable`,
                        });
                      });
                    }

                    removeSerializedProducts(index + 1);
                  },
                );
              };

              /* =========================
   FINALIZE DISPATCH
========================= */

              const finalizeDispatch = () => {
                const movementPromises = [];

                /* =========================
   STANDARD MOVEMENTS
========================= */

                for (const item of standardItems) {
                  movementPromises.push(
                    createMovement({
                      product_id: item.product_id,

                      movement_type: "STOCK_OUT",

                      quantity: item.quantity,

                      performed_by: req.user.id,

                      reference: dispatch.reference,
                    }),
                  );
                }

                /* =========================
   SERIALIZED MOVEMENTS
========================= */

                for (const serial of dispatchSerials) {
                  movementPromises.push(
                    createMovement({
                      product_id: serial.product_id,

                      serial_number: serial.serial_number,

                      movement_type: "STOCK_OUT",

                      quantity: 1,

                      performed_by: req.user.id,

                      reference: dispatch.reference,
                    }),
                  );
                }
                const completeQuery = `
    UPDATE dispatch_transactions
    SET
      status = 'COMPLETED',
      completed_at = NOW()
    WHERE id = ?
  `;

                Promise.all(movementPromises)
                  .then(() => {
                    connection.query(completeQuery, [id], (completeErr) => {
                      if (completeErr) {
                        return connection.rollback(() => {
                          connection.release();

                          res.status(500).json({
                            error: completeErr.message,
                          });
                        });
                      }

                      connection.commit((commitErr) => {
                        if (commitErr) {
                          return connection.rollback(() => {
                            connection.release();

                            res.status(500).json({
                              error: commitErr.message,
                            });
                          });
                        }

                        connection.release();

                    
                        return res.json({
                          message: "Dispatch completed successfully",
                        });
                      });
                    });
                  })
                  .catch((movementErr) => {
                    return connection.rollback(() => {
                      connection.release();

                      res.status(500).json({
                        error: movementErr.message,
                      });
                    });
                  });
              };

              removeStandardProducts();
            },
          );
        });
      });
    });
  });
};
