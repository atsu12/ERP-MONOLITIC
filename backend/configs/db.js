const mysql = require("mysql2");

const mode = process.env.DB_MODE || "LOCAL";

const prefix = mode === "REMOTE" ? "DB_REMOTE" : "DB_LOCAL";

const pool = mysql.createPool({
  host: process.env[`${prefix}_HOST`],
  port: process.env[`${prefix}_PORT`],
  user: process.env[`${prefix}_USER`],
  password: process.env[`${prefix}_PASSWORD`],
  database: process.env[`${prefix}_NAME`],
  waitForConnections: true,
  connectionLimit: 10,
});

console.log(`Using ${mode} database`);

module.exports = pool;