const db = require("../configs/db");

const { getIO } = require("../socket");

// GET SETTINGS
exports.getSettings = (req, res) => {
  db.query(
    "SELECT * FROM settings LIMIT 1",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch settings",
        });
      }

      res.json(results[0]);
    }
  );
};

// UPDATE SETTINGS
exports.updateSettings = (req, res) => {
  const {
    display_currency,
    currency_symbol,
    usd_exchange_rate,
    company_multiplier,
  } = req.body;

  db.query(
    `
      UPDATE settings
      SET
        display_currency = ?,
        currency_symbol = ?,
        usd_exchange_rate = ?,
        company_multiplier = ?
      WHERE id = 1
    `,
    [
      display_currency,
      currency_symbol,
      usd_exchange_rate,
      company_multiplier,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update settings",
        });
      }

      getIO().emit("settings-updated");

      res.json({
        message: "Settings updated successfully",
      });
    }
  );
};
