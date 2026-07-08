const { getIO } = require("../socket");

const db = require("../configs/db");

const logActivity = require("../utils/logActivity");

// SCAN SERIAL NUMBER (SAFE + TRANSACTION)
exports.scanItem = (req, res) => {
  const { serial_number } = req.body;

  if (!serial_number) {
    return res.status(400).json({ message: "Serial number is required" });
  }

  // Get connection from pool
  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: err.message });
      }

      const findQuery = `
        SELECT pi.id, pi.status, p.name, p.id as product_id
        FROM product_items pi
        JOIN products p ON p.id = pi.product_id
        WHERE pi.serial_number = ?
        FOR UPDATE
      `;

      connection.query(findQuery, [serial_number], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: err.message });
          });
        }

        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({ message: "Serial not found" });
          });
        }

        const item = results[0];

        // 🚨 Prevent double scan
        if (item.status === "OUT") {
          return connection.rollback(() => {
            connection.release();
            res.status(400).json({ message: "Item already scanned out" });
          });
        }

        // Update status
        connection.query(
          'UPDATE product_items SET status = "OUT" WHERE id = ?',
          [item.id],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: err.message });
              });
            }

            // Log movement
            connection.query(
              'INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, "STOCK_OUT", 1)',
              [item.product_id],
              (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: err.message });
                  });
                }

                // Commit transaction
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: err.message });
                    });
                  }

                  connection.release();

                  getIO().emit("product-updated");

                  logActivity(
                    req.user.id,
                    req.user.username,
                    `Scanned out: ${item.name} (${serial_number})`,
                  );

                  res.json({
                    message: "Item scanned successfully",
                    product: item.name,
                    serial_number: serial_number,
                  });
                });
              },
            );
          },
        );
      });
    });
  });
};
