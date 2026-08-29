const logger = require("../utils/logger");

const db = require("../configs/db");

exports.getActivityLogs = (req, res) => {
  const { fromDate, toDate } = req.query;

  const conditions = [];
  const params = [];

  /*
   * Audit history is limited to the last 3 years.
   * The database records are NOT deleted.
   */

  conditions.push("created_at >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)");

  if (fromDate) {
    conditions.push("created_at >= ?");
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(toDate);
  }

  const query = `
    SELECT *
    FROM activity_logs
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      logger.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }

    res.json({
      logs: results,
    });
  });
};
