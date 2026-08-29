const logger = require("./utils/logger");

const {
  Server
} = require("socket.io");

let io;

function initSocket(server) {

  io = new Server(server, {

    cors: {

      origin: "*",

      methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE"
      ],

    },

  });

  io.on(
    "connection",
    (socket) => {

      logger.info(`Socket connected: ${socket.id}`);

      socket.on(
        "disconnect",
        () => {

          logger.info(`Socket disconnected: ${socket.id}`);
        }
      );

    }
  );

  return io;

}

function getIO() {

  if (!io) {

    throw new Error(
      "Socket.io not initialized"
    );

  }

  return io;

}

module.exports = {

  initSocket,

  getIO,

};