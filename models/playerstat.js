'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class estadisticas extends Model {
    static associate(models) {
      // Relaciones si las hay
    }
  }

  estadisticas.init({
    altura: DataTypes.STRING,
    peso: DataTypes.STRING,
    grasaCorporal: DataTypes.STRING,
    masaMuscular: DataTypes.STRING,
    fuerza: DataTypes.STRING,
    velocidadMaxima: DataTypes.STRING,
    resistenciaAerobica: DataTypes.STRING,
    resistenciaAnaerobica: DataTypes.STRING,
    flexibilidad: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'estadisticas', // nombre del modelo lógico
    tableName: 'estadisticas'  // nombre real de la tabla en la BD
  });

  return estadisticas;
};
