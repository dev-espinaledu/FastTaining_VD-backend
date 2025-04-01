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
      Equipo.hasMany(models.DatoSesion, {
        foreignKey: "equipo_id",
        as: "datos_sesions",
      });
    }
  }
  Equipo.init(
    {
      nombre: DataTypes.STRING,
      escudo_url: DataTypes.STRING,
      descripcion: DataTypes.STRING,

    },
    {
      sequelize,
      modelName: "Equipo",
      tableName: "equipos",
      categoria: DataTypes.ENUM('Sub-13','Sub-15','Sub-17','Sub-20'),
    },
  );
  return Equipo;
};
