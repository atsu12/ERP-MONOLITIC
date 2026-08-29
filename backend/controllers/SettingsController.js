const db = require("../configs/db");

const { getIO } = require("../socket");

// GET SETTINGS
exports.getSettings = (req, res) => {
  db.query("SELECT * FROM settings WHERE id = 1", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch settings",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Settings record not found",
      });
    }

    res.json(results[0]);
  });
};

// UPDATE SETTINGS
exports.updateSettings = (req, res) => {
  const {
    base_currency,
    display_currency,
    currency_symbol,
    usd_exchange_rate,
    company_multiplier,

    company_name,
    company_address,
    company_phone,
    company_email,
    company_website,
    company_vat,

    company_logo_path,
    company_header,
    company_footer,

    invoice_prefix,
    invoice_next_number,
    invoice_number_length,
    invoice_validity_days,
    invoice_vat_rate,

    invoice_template_path,

    quotation_template_path,
    purchase_order_template_path,
    delivery_note_template_path,
  } = req.body;

  db.query(
    `
      UPDATE settings
      SET
        base_currency = ?,
        display_currency = ?,
        currency_symbol = ?,
        usd_exchange_rate = ?,
        company_multiplier = ?,

        company_name = ?,
        company_address = ?,
        company_phone = ?,
        company_email = ?,
        company_website = ?,
        company_vat = ?,

        company_logo_path = ?,
        company_header = ?,
        company_footer = ?,

        invoice_prefix = ?,
        invoice_next_number = ?,
        invoice_number_length = ?,
        invoice_validity_days = ?,
        invoice_vat_rate = ?,

        invoice_template_path = ?,

        quotation_template_path = ?,
        purchase_order_template_path = ?,
        delivery_note_template_path = ?

        WHERE id = 1
      `,
    
      [
      base_currency,
      display_currency,
      currency_symbol,
      usd_exchange_rate,
      company_multiplier,

      company_name,
      company_address,
      company_phone,
      company_email,
      company_website,
      company_vat,

      company_logo_path,
      company_header,
      company_footer,

      invoice_prefix,
      invoice_next_number,
      invoice_number_length,
      invoice_validity_days,
      invoice_vat_rate,

      invoice_template_path,

      quotation_template_path,
      purchase_order_template_path,
      delivery_note_template_path,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update settings",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Settings record not found",
        });
      }

      getIO().emit("settings-updated");

      res.json({
        message: "Settings updated successfully",
      });
    },
  );
};
