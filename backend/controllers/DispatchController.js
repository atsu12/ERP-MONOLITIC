const db = require("../configs/db");
const logger = require("../utils/logger");

const { getIO } = require("../socket");

const logActivity = require("../utils/logActivity");

const { createMovement } = require("./MovementController");

// ========================
// CANCEL DISPATCH
// =========================

const renderDispatch = require("../views/dispatchPrint");

exports.cancelDispatch = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE dispatch_transactions
    SET status = 'CANCELLED'
    WHERE id = ?
      AND status = 'PENDING_PAYMENT'
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Dispatch not found or cannot be cancelled",
      });
    }

    logActivity(req.user.id, req.user.username, `Cancelled dispatch #${id}`);

    getIO().emit("dispatch-updated");

    return res.json({
      message: "Dispatch cancelled",
    });
  });
};

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

  if (!Array.isArray(items) || !Array.isArray(serials)) {
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

  db.query(productsQuery, [productIds], async (productsErr, products) => {
    if (productsErr) {
      return res.status(500).json({
        error: "Internal server error",
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

    const templateTotals =
      await invoiceGenerator.calculateTemplateTotals(dispatchItems);

    const discount = Number(templateTotals.discount.toFixed(2));

    const vat = Number(templateTotals.vat.toFixed(2));

    const grandTotal = Number(templateTotals.grandTotal.toFixed(2));

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
    vat,
    grand_total,
    staff_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        discount,
        vat,
        grandTotal,
        req.user.id,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: "Internal server error",
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
              error: "Internal server error",
            });
          }

          if (serialNumbers.length === 0) {
            logActivity(
              req.user.id,
              req.user.username,
              `Created dispatch ${reference}`,
            );

            getIO().emit("dispatch-updated");

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
            if (productItems.length !== serialNumbers.length) {
              return res.status(400).json({
                error: "One or more serial numbers are no longer available.",
              });
            }
            if (serialErr) {
              return res.status(500).json({
                error: "Internal server error",
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
                    error: "Internal server error",
                  });
                }

                logActivity(
                  req.user.id,
                  req.user.username,
                  `Created dispatch ${reference}`,
                );

                getIO().emit("dispatch-updated");

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
      dt.discount,
      dt.vat,
      dt.grand_total,
      s.currency_symbol,
      dt.status,
      dt.created_at,

      u.username AS staff_name

    FROM dispatch_transactions dt
    cross join settings s

    JOIN users u
      ON u.id = dt.staff_id

    WHERE dt.status = 'PENDING_PAYMENT'

    ORDER BY dt.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    return res.json({
      dispatches: results,
    });
  });
};

/* =========================
   GET PAID DISPATCHES
========================= */

exports.getPaidDispatches = (req, res) => {
  const query = `
    SELECT
      dt.id,
      dt.reference,
      dt.customer_name,
      dt.contact,
      dt.contact_person,
      dt.location,
      dt.subtotal,
      dt.discount,
      dt.vat,
      dt.grand_total,
      dt.status,
      dt.created_at,

      u.username AS staff_name

    FROM dispatch_transactions dt
    cross join settings s

    JOIN users u
      ON u.id = dt.staff_id

    WHERE dt.status = 'PAYMENT_CONFIRMED'

    ORDER BY dt.payment_confirmed_at ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Internal server error",
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

exports.getDispatchById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      dt.id,
      dt.reference,
      dt.customer_name,
      dt.contact,
      dt.contact_person,
      dt.location,
      dt.status,
      dt.subtotal,
      dt.discount,
      dt.vat,
      dt.grand_total,
      s.currency_symbol,
      dt.created_at
    FROM dispatch_transactions dt
    cross join settings s
    WHERE dt.id = ?
  `;

  db.query(query, [id], (err, dispatchRows) => {
    if (err) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (dispatchRows.length === 0) {
      return res.status(404).json({
        error: "Dispatch not found",
      });
    }

    const dispatch = dispatchRows[0];

    const itemsQuery = `
      SELECT
        di.id,
        di.quantity,
        di.unit_price,
        di.line_total,

        p.id AS product_id,
        p.name,
        p.track_serial

      FROM dispatch_items di

      JOIN products p
        ON p.id = di.product_id

      WHERE di.transaction_id = ?
    `;

    db.query(itemsQuery, [id], (itemsErr, items) => {
      if (itemsErr) {
        return res.status(500).json({
          error: "Internal server error",
        });
      }

      return res.json({
        dispatch,
        items,
      });
    });
  });
};

/* =========================
   CONFIRM PAYMENT
========================= */

exports.confirmPayment = (req, res) => {
  const { id } = req.params;

  const getDispatchQuery = `
    SELECT
      customer_name,
      contact,
      contact_person,
      location
    FROM dispatch_transactions
    WHERE id = ?
      AND status = 'PENDING_PAYMENT'
  `;

  db.query(getDispatchQuery, [id], (dispatchErr, dispatchRows) => {
    if (dispatchErr) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (dispatchRows.length === 0) {
      return res.status(400).json({
        error: "Dispatch not found or already processed",
      });
    }

    const dispatch = dispatchRows[0];

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
          error: "Internal server error",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          error: "Dispatch not found or already processed",
        });
      }

      /*
       * =========================
       * AUTO-CREATE / UPDATE CUSTOMER
       * =========================
       */

      const customerLookupQuery = `
        SELECT id
        FROM customers
        WHERE
          (
            contact IS NOT NULL
            AND contact <> ''
            AND contact = ?
          )
          OR
          (
            (contact IS NULL OR contact = '')
            AND customer_name = ?
          )
        LIMIT 1
      `;

      db.query(
        customerLookupQuery,
        [dispatch.contact || null, dispatch.customer_name],
        (customerLookupErr, customerRows) => {
          if (customerLookupErr) {
            return res.status(500).json({
              error:
                "Payment confirmed, but customer record could not be checked",
            });
          }

          if (customerRows.length > 0) {
            const customerId = customerRows[0].id;

            const updateCustomerQuery = `
              UPDATE customers
              SET
                customer_name = ?,
                contact = ?,
                contact_person = ?,
                location = ?
              WHERE id = ?
            `;

            db.query(
              updateCustomerQuery,
              [
                dispatch.customer_name,
                dispatch.contact || null,
                dispatch.contact_person || null,
                dispatch.location || null,
                customerId,
              ],
              (updateCustomerErr) => {
                if (updateCustomerErr) {
                  return res.status(500).json({
                    error:
                      "Payment confirmed, but customer record could not be updated",
                  });
                }

                logActivity(
                  req.user.id,
                  req.user.username,
                  `Confirmed payment for dispatch #${id}`,
                );

                getIO().emit("dispatch-paid");

                return res.json({
                  message: "Payment confirmed successfully",
                });
              },
            );

            return;
          }

          const createCustomerQuery = `
            INSERT INTO customers (
              customer_name,
              contact,
              contact_person,
              location
            )
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            createCustomerQuery,
            [
              dispatch.customer_name,
              dispatch.contact || null,
              dispatch.contact_person || null,
              dispatch.location || null,
            ],
            (createCustomerErr) => {
              if (createCustomerErr) {
                return res.status(500).json({
                  error:
                    "Payment confirmed, but customer record could not be created",
                });
              }

              logActivity(
                req.user.id,
                req.user.username,
                `Confirmed payment for dispatch #${id}`,
              );

              getIO().emit("dispatch-paid");

              return res.json({
                message: "Payment confirmed successfully",
              });
            },
          );
        },
      );
    });
  });
};

/* =========================
   ADJUST DISPATCH PRICING
========================= */

exports.adjustDispatchPricing = (req, res) => {
  const { id } = req.params;

  const discount = Number(req.body.discount);
  const vat = Number(req.body.vat);

  if (!Number.isFinite(discount) || discount < 0) {
    return res.status(400).json({
      error: "Invalid discount amount",
    });
  }

  if (!Number.isFinite(vat) || vat < 0) {
    return res.status(400).json({
      error: "Invalid VAT amount",
    });
  }

  const query = `
    SELECT
      reference,
      subtotal,
      status
    FROM dispatch_transactions
    WHERE id = ?
  `;

  db.query(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Dispatch not found",
      });
    }

    const dispatch = rows[0];

    if (dispatch.status !== "PENDING_PAYMENT") {
      return res.status(400).json({
        error: "Only pending-payment dispatches can be adjusted",
      });
    }

    if (discount > Number(dispatch.subtotal)) {
      return res.status(400).json({
        error: "Discount cannot exceed subtotal",
      });
    }

    const grandTotal = Number(
      (Number(dispatch.subtotal) - discount + vat).toFixed(2),
    );

    const updateQuery = `
      UPDATE dispatch_transactions
      SET
        discount = ?,
        vat = ?,
        grand_total = ?
      WHERE id = ?
      AND status = 'PENDING_PAYMENT'
    `;

    db.query(
      updateQuery,
      [discount, vat, grandTotal, id],
      (updateErr, result) => {
        if (updateErr) {
          return res.status(500).json({
            error: "Internal server error",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(400).json({
            error: "Dispatch is no longer eligible for adjustment",
          });
        }

        logActivity(
          req.user.id,
          req.user.username,
          `Adjusted pricing for dispatch #${id}`,
        );

        getIO().emit("dispatch-updated");

        return res.json({
          message: "Dispatch pricing updated successfully",
          discount,
          vat,
          grand_total: grandTotal,
        });
      },
    );
  });
};

/* =========================
   PRINT DISPATCH
========================= */

exports.printDispatch = (req, res) => {
  const { id } = req.params;

  const dispatchQuery = `
    SELECT
      id,
      reference,
      customer_name,
      contact,
      contact_person,
      location,
      status,
      subtotal,
      discount,
      grand_total,
      currency,
      created_at
    FROM dispatch_transactions
    WHERE id = ?
  `;

  db.query(dispatchQuery, [id], (dispatchErr, dispatchRows) => {
    if (dispatchErr) {
      return res.status(500).send(dispatchErr.message);
    }

    if (dispatchRows.length === 0) {
      return res.status(404).send("Dispatch not found");
    }

    const dispatch = dispatchRows[0];

    const itemsQuery = `
      SELECT
        p.name,
        di.quantity,
        di.unit_price,
        di.line_total
      FROM dispatch_items di
      JOIN products p
        ON p.id = di.product_id
      WHERE di.transaction_id = ?
      ORDER BY p.name
    `;

    db.query(itemsQuery, [id], (itemsErr, items) => {
      if (itemsErr) {
        return res.status(500).send(itemsErr.message);
      }

      res.setHeader("Content-Type", "text/html");

      return res.send(renderDispatch(dispatch, items));
    });
  });
};

/* =========================
   EXPORT INVOICE
========================= */

/* =========================
   EXPORT PROFORMA INVOICE
========================= */

const invoiceGenerator = require("../services/invoiceGenerator");

/* =========================
   EXPORT PROFORMA
========================= */

exports.exportProforma = async (req, res) => {
  try {
    const dispatch = {
      ...req.body,
      staff_id: req.user.id,
      staff_name: req.user.username,
    };

    const { workbook } =
      await invoiceGenerator.generateProformaInvoice(dispatch);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Proforma-Invoice.xlsx"',
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.exportInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const [dispatchRows] = await db.promise().query(
      `
      SELECT *
      FROM dispatch_transactions
      WHERE id = ?
      `,
      [id],
    );

    if (dispatchRows.length === 0) {
      return res.status(404).json({
        message: "Dispatch not found",
      });
    }

    const dispatch = dispatchRows[0];

    const { workbook } = await invoiceGenerator.generateProformaInvoice(
      dispatch,
      "SALES INVOICE",
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${dispatch.reference}.xlsx"`,
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.completeDispatch = (req, res) => {
  const { id } = req.params;

  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        connection.release();

        return res.status(500).json({
          error: "Internal server error",
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
              error: "Internal server error",
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
                error: "Internal server error",
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
                    error: "Internal server error",
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
                          error: "Internal server error",
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
                          error: "Internal server error",
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
                    AND status = 'PAYMENT_CONFIRMED'
                `;

                Promise.all(movementPromises)
                  .then(() => {
                    connection.query(
                      completeQuery,
                      [id],
                      (completeErr, result) => {
                        if (completeErr) {
                          return connection.rollback(() => {
                            connection.release();

                            res.status(500).json({
                              error: "Internal server error",
                            });
                          });
                        }

                        if (result.affectedRows === 0) {
                          return connection.rollback(() => {
                            connection.release();

                            res.status(400).json({
                              error:
                                "Dispatch is no longer eligible for completion",
                            });
                          });
                        }

                        connection.commit((commitErr) => {
                          if (commitErr) {
                            return connection.rollback(() => {
                              connection.release();

                              res.status(500).json({
                                error: "Internal server error",
                              });
                            });
                          }

                          connection.release();

                          logActivity(
                            req.user.id,
                            req.user.username,
                            `Completed dispatch ${dispatch.reference}`,
                          );

                          getIO().emit("dispatch-completed");
                          getIO().emit("product-updated");

                          return res.json({
                            message: "Dispatch completed successfully",
                          });
                        });
                      },
                    );
                  })
                  .catch((movementErr) => {
                    return connection.rollback(() => {
                      connection.release();

                      res.status(500).json({
                        error: "Internal server error",
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
