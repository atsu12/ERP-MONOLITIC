const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logActivity');

const pool = require('../configs/db');

const login = (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password required'
    });
  }

  pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {

      if (err) {
        return res.status(500).json({
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      const user = results[0];

      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET || 'supersecret',
        {
          expiresIn: '1d',
        }
      );
// Log the activity
      logActivity(
        user.id,
        user.username,
        'User logged in'
    );

    // Return the token and user info
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    }
  );
};

module.exports = {
  login,
};
