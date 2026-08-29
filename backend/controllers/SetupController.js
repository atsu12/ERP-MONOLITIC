const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const db = require("../configs/db").promise();

const getSetupStatus = async (req, res) => {
  try {
    const [[result]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    res.json({
      initialized: result.total > 0,
    });
  } catch (error) {
    logger.error(`Setup status error: ${error.message}`);

    res.status(500).json({
      message: "Failed to check setup status",
    });
  }
};

const createFirstAdmin = async (req, res) => {
  try {
    const { username, telephone, password } = req.body;

    if (!username || !telephone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [[result]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    if (result.total > 0) {
      return res.status(403).json({
        message: "System already initialized",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      `
        INSERT INTO users (
          username,
          telephone,
          password_hash,
          role
        )
        VALUES (?, ?, ?, 'ADMIN')
      `,
      [username, telephone, password_hash]
    );

    res.status(201).json({
      message: "Administrator account created successfully",
    });
  } catch (error) {
    logger.error(`Admin setup error: ${error.message}`);

    res.status(500).json({
      message: "Failed to create administrator account",
    });
  }
};

module.exports = {
  getSetupStatus,
  createFirstAdmin,
};
