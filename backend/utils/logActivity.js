const logger = require("./logger");

const pool = require("../configs/db");

const logActivity = (userId, username, action) => {


  pool.query(
    `
    INSERT INTO activity_logs
    (user_id, username, action)
    VALUES (?, ?, ?)
    `,
    [userId, username, action],
    (err) => {
      if (err) {
        logger.error(`Activity log error: ${err.message}`);
      }
    },
  );
};

module.exports = logActivity;
