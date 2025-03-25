'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DatoSesion extends Model {
    static associate(models) {
      DatoSesion.belongsTo(models.Jugador, {
        foreignKey: "jugador_id",
        as: "jugadores",
      });
      DatoSesion.hasOne(models.Entrenamiento, {
        foreignKey: "datos_sesion_id",
        as: "entrenamiento",
      });
    }
  }
  DatoSesion.init({
    fecha: DataTypes.DATE,
    objetivo: DataTypes.STRING,
    jugador_id: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'DatoSesion',
    tableName: 'datos_sesion'
  });
  return DatoSesion;
};