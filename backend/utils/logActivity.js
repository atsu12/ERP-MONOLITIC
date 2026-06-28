const pool = require('../configs/db');

const logActivity = (
  userId,
  username,
  action
) => {

  pool.query(
    `
    INSERT INTO activity_logs
    (user_id, username, action)
    VALUES (?, ?, ?)
    `,
    [userId, username, action],
    (err) => {

      if (err) {
        console.log(
          'Activity log error:',
          err
        );
      }

    }
  );
};

module.exports = logActivity;
