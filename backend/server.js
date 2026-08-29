const logger = require('./utils/logger');

require('dotenv').config();

const cors = require('cors');

const express = require('express');

const path = require('path');

const http = require('http');

const {
  initSocket
} = require('./socket');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

/* =========================
   UPLOADS
========================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
);

/* =========================
   API ROUTES
========================= */

const routes =
  require('./routes');

app.use('/api', routes);

/* =========================
   FRONTEND STATIC FILES
========================= */

const frontendPath =
  path.join(
    __dirname,
    '../frontend/dist'
  );

logger.info(`Serving frontend from: ${frontendPath}`);

app.use(
  express.static(frontendPath)
);

/* =========================
   REACT ROUTER SUPPORT
========================= */

app.get('*', (
  req,
  res,
  next
) => {

  if (
    req.path.startsWith('/api')
  ) {

    return next();

  }

  res.sendFile(
    path.join(
      frontendPath,
      'index.html'
    )
  );

});

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

// CREATE HTTP SERVER

const server =
  http.createServer(app);

// INITIALIZE SOCKET.IO

initSocket(server);

// START SERVER

server.listen(PORT, () => {

  logger.info(`Backend server running on port ${PORT}`);

});
