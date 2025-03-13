const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bd", "root", "contraseña", {
    host: "postgresql://fast-training_owner:npg_fgy8nA9aCDXR@ep-jolly-sky-a8ucqzga-pooler.eastus2.azure.neon.tech/fast-training?sslmode=require",
    dialect: "postgres",
    dialectOptions: {
    ssl: {
        require: true,
    rejectUnauthorized: false
    }
},
    logging: false
});

module.exports = sequelize;