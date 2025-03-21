'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entrenamiento extends Model {
    static associate(models) {
      Entrenamiento.hasMany(models.Jugador, {
        foreignKey: "id_jugador",
        as: "Jugadores",
      });
      Entrenamiento.hasMany(models.DatoSesion, {
        foreignKey: "id_datos_sesion",
        as: "datos_sesion",
      });
    }
  }
  Entrenamiento.init({
    id_jugador: DataTypes.SMALLINT,
    fase_inicial: DataTypes.JSONB,
    fase_central: DataTypes.JSONB,
    fase_final: DataTypes.JSONB,
    id_datos_sesion: DataTypes.SMALLINT,


  }, {
    sequelize,
    modelName: 'Entrenamiento',
    tableName: 'entrenamientos'
  });
  return Entrenamiento;
};