const db = require("../configs/db");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

exports.uploadSettingsAsset = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const { type } = req.params;

  const relativePath = path
    .relative(path.join(__dirname, ".."), req.file.path)
    .split(path.sep)
    .join("/");

  const columnMap = {
    logo: "company_logo_path",
    invoice: "invoice_template_path",
    quotation: "quotation_template_path",
    purchase_order: "purchase_order_template_path",
    delivery_note: "delivery_note_template_path",
  };

  const column = columnMap[type];

  if (!column) {
    return res.status(400).json({
      message: "Invalid upload type",
    });
  }

  // Read the current asset first
  db.query(
    `SELECT ${column} AS currentPath FROM settings WHERE id = 1`,
    (selectErr, rows) => {
      if (selectErr) {
        return res.status(500).json({
          message: "Failed to read current asset",
        });
      }

      const currentPath = rows[0]?.currentPath;

      // Delete previous file if it exists
      if (currentPath) {
        const absolutePath = path.join(__dirname, "..", currentPath);

        if (fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
          } catch (err) {
            logger.warn(`Could not delete previous asset: ${err.message}`);
          }
        }
      }

      // Save the new asset path
      db.query(
        `UPDATE settings SET ${column} = ? WHERE id = 1`,
        [relativePath],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              message: "Failed to save upload",
            });
          }

          res.json({
            message: "Upload successful",
            path: relativePath,
          });
        },
      );
    },
  );
};

exports.deleteSettingsAsset = (req, res) => {
  const { type } = req.params;

  const columnMap = {
    logo: "company_logo_path",
    invoice: "invoice_template_path",
    quotation: "quotation_template_path",
    purchase_order: "purchase_order_template_path",
    delivery_note: "delivery_note_template_path",
  };

  const column = columnMap[type];

  if (!column) {
    return res.status(400).json({
      message: "Invalid asset type",
    });
  }

  db.query(
    `SELECT ${column} AS assetPath FROM settings WHERE id = 1`,
    (selectErr, rows) => {
      if (selectErr) {
        return res.status(500).json({
          message: "Failed to read asset",
        });
      }

      const assetPath = rows[0]?.assetPath;

      if (assetPath) {
        const absolutePath = path.join(
          __dirname,
          "..",
          assetPath,
        );

        if (fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
          } catch (err) {
            logger.warn(`Could not delete asset: ${err.message}`);
          }
        }
      }

      db.query(
        `UPDATE settings SET ${column} = NULL WHERE id = 1`,
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              message: "Failed to clear asset",
            });
          }

          res.json({
            message: "Asset deleted successfully",
          });
        },
      );
    },
  );
};
