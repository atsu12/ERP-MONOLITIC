module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      env: {
        DB_HOST: "192.168.43.248",
        DB_PORT: "3306",
        DB_USER: "appuser",
        DB_PASSWORD: "learnIT02#",
        DB_NAME: "react_node_app",
        PORT: "5000"
      }
    }
  ]
};
