const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bd", "root", "contraseña", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

module.exports = sequelize;