const { Sequelize } = require('sequelize');

// Crear la instancia de Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',  // Ajusta esto a tu base de datos
  host: 'localhost',    // Ajusta esto a tu host
  username: 'usuario',  // Ajusta esto a tu nombre de usuario
  password: 'contraseña', // Ajusta esto a tu contraseña
  database: 'calendarios_db', // Ajusta esto a tu base de datos
});

// Requerir el modelo y pasarle la instancia de sequelize
const Calendario = require('./calendario')(sequelize, Sequelize.DataTypes);

// Sincronizar la base de datos
sequelize.sync()
  .then(() => console.log("Base de datos sincronizada"))
  .catch(err => console.error("Error al sincronizar la base de datos:", err));

module.exports = {
  sequelize,
  Calendario,
};
