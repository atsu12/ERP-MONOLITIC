const db = require("../configs/db").promise();
const logger = require("../utils/logger");

/* =========================
   GET CUSTOMERS
========================= */

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT
        id,
        customer_name,
        contact,
        contact_person,
        location,
        created_at,
        updated_at
      FROM customers
      ORDER BY customer_name ASC
    `);

    res.json({
      customers,
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

/* =========================
   GET CUSTOMER
========================= */

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [customers] = await db.query(
      `
      SELECT
        id,
        customer_name,
        contact,
        contact_person,
        location,
        created_at,
        updated_at
      FROM customers
      WHERE id = ?
      `,
      [id],
    );

    if (customers.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      customer: customers[0],
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};
