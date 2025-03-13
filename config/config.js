require("dotenv").config(); // Si usas variables de entorno
module.exports = {
  development: {
    username: "fast-training_owner",
    password: "npg_fgy8nA9aCDXR",
    database: "fast-training",
    host: "ep-jolly-sky-a8ucqzga-pooler.eastus2.azure.neon.tech",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};
