const { Sequelize } = require('sequelize');
const config = require('./config/config.js')['development']; // Cambia si usas otro entorno

const sequelize = new Sequelize(config.database, config.username, config.password, config);

(async () => {
  try {
    await sequelize.query(`DELETE FROM "SequelizeMeta" WHERE name = '20250401064026-historial_datos_promedio.js';`);
    console.log('✅ Migracion eliminada de SequelizeMeta');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error eliminando migracion:', error);
    process.exit(1);
  }
})();
