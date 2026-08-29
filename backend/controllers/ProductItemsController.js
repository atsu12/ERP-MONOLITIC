const logger = require("../utils/logger");

const db = require("../configs/db");

exports.getProductItems = (req, res) => {
  const { productId } = req.params;

  const query = `
    SELECT
      id,
      serial_number,
      status,
      created_at
    FROM product_items
    WHERE product_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      logger.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    res.json({
      items: results,
    });
  });
};
