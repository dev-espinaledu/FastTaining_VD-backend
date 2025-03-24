"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Equipo extends Model {
    static associate(models) {
      Equipo.hasMany(models.Entrenador, {
        foreignKey: "equipo_id",
        as: "entrenadores",
      });
      Equipo.hasMany(models.Jugador, {
        foreignKey: "equipo_id",
        as: "jugadores",
      });
    }
  }
  Equipo.init(
    {
      nombre: DataTypes.STRING,
      escudo_url: DataTypes.STRING,
      descripcion: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Equipo",
      tableName: "equipos",
    },
  );
  return Equipo;
};
