const { Sequelize } = require("sequelize");
const config = require("./config/config.js")["development"]; // Usa la configuración de desarrollo

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
  },
);

module.exports = sequelize;
