const bcrypt = require("bcrypt");

const logger = require("../utils/logger");

const db = require("../configs/db").promise();

/* =========================
   GET USERS
========================= */

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
          SELECT
            id,
            username,
            email,
            role,
            created_at
          FROM users
          ORDER BY created_at DESC
        `);

    res.json({
      users,
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

/* =========================
   CREATE USER
========================= */

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    /* VALIDATION */

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* ROLE SECURITY */

    if (req.user.role === "MANAGER" && role !== "STAFF") {
      return res.status(403).json({
        message: "Managers can only create STAFF users",
      });
    }

    /* CHECK DUPLICATES */

    const [existing] = await db.query(
      `
          SELECT id
          FROM users
          WHERE email = ?
          OR username = ?
        `,
      [email, username],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    /* HASH PASSWORD */

    const password_hash = await bcrypt.hash(password, 10);

    /* CREATE USER */

    await db.query(
      `
        INSERT INTO users (
          username,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?)
      `,
      [username, email, password_hash, role || "STAFF"],
    );

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

/* =========================
   UPDATE USER
========================= */

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { username, email, role } = req.body;

    /* VALIDATION */

    if (!username || !email || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* ROLE SECURITY */

    if (req.user.role === "MANAGER" && role !== "STAFF") {
      return res.status(403).json({
        message: "Managers can only manage STAFF users",
      });
    }

    /* CHECK DUPLICATES */

    const [existing] = await db.query(
      `
          SELECT id
          FROM users
          WHERE (
            email = ?
            OR username = ?
          )
          AND id != ?
        `,
      [email, username, id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Another user already exists with these credentials",
      });
    }

    /* UPDATE USER */

    await db.query(
      `
        UPDATE users
        SET
          username = ?,
          email = ?,
          role = ?
        WHERE id = ?
      `,
      [username, email, role, id],
    );

    res.json({
      message: "User updated successfully",
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

/* =========================
   DELETE USER
========================= */

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    /* CANNOT DELETE YOURSELF */

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    /* GET TARGET USER */

    const [[userToDelete]] = await db.query(
      `
          SELECT
            id,
            role
          FROM users
          WHERE id = ?
        `,
      [id],
    );

    if (!userToDelete) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* PREVENT DELETING LAST ADMIN */

    if (userToDelete.role === "ADMIN") {
      const [[adminCount]] = await db.query(
        `
            SELECT COUNT(*) AS total
            FROM users
            WHERE role = 'ADMIN'
          `,
      );

      if (adminCount.total <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last ADMIN account",
        });
      }
    }

    /* PREVENT DELETING USERS WITH HISTORY */

    const [[activityCount]] = await db.query(
      `
    SELECT COUNT(*) AS total
    FROM activity_logs
    WHERE user_id = ?
  `,
      [id],
    );

    const [[movementCount]] = await db.query(
      `
    SELECT COUNT(*) AS total
    FROM stock_movements
    WHERE user_id = ?
  `,
      [id],
    );

    if (activityCount.total > 0 || movementCount.total > 0) {
      return res.status(400).json({
        message:
          "This user cannot be deleted because they have historical activity.",
      });
    }

    /* DELETE USER */

    await db.query(
      `
        DELETE FROM users
        WHERE id = ?
      `,
      [id],
    );

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const [[user]] = await db.query(
      `
          SELECT
            id,
            username,
            password_hash
          FROM users
          WHERE id = ?
        `,
      [req.user.id],
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `,
      [password_hash, req.user.id],
    );

    const logActivity = require("../utils/logActivity");

    logActivity(req.user.id, req.user.username, "Password changed");

    res.json({
      message: "Password updated successfully",
      requireRelogin: true,
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
};
