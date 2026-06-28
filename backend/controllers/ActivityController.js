const db = require('../configs/db');

exports.getActivityLogs = (req, res) => {

  const query = `
    SELECT *
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.query(query, (err, results) => {

    if (err) {

      return res.status(500).json({
        error: err.message
      });

    }

    res.json({
      logs: results
    });

  });
};
