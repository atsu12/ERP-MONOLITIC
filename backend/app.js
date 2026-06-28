require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./utils/logger');
const db = require('./configs/db');
const path = require('path');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// DB CONNECTION TEST
db.getConnection((err, connection) => {
   if (err) {
      logger.error(`Error connecting to MySQL: ${err.message}`);
   } else {
      logger.info('Connected to MySQL Database');
      connection.release();
   }
});

// HEALTH CHECK
app.get('/health', (req, res) => {
   res.json("Health check endpoint");
});

// API ROUTES
app.use('/api', routes);

// SERVE FRONTEND
const distPath = path.join(__dirname, '../frontend/dist');

console.log("Serving frontend from:", distPath);

app.use(express.static(distPath));

// ROOT
app.get('/', (req, res) => {
   res.sendFile(path.join(distPath, 'index.html'));
});

// SPA fallback
app.get('*', (req, res) => {
   res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;