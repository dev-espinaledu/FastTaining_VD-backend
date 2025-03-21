'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DatoSesion extends Model {
    static associate(models) {
      DatoSesion.belongsTo(models.Jugador, {
        foreignKey: "id_jugador",
        as: "Jugadores",
      });
      DatoSesion.hasMany(models.Entrenamiento, {
        foreignKey: "id_datos_sesion",
        as: "datos_sesion",
      });
    }
  }
  DatoSesion.init({
    fecha: DataTypes.DATE,
    objetivo: DataTypes.STRING,
    id_jugador: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'DatoSesion',
    tableName: 'datos_sesion'
  });
  return DatoSesion;
};