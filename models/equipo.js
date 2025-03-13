"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Equipo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    },
    {
      sequelize,
      modelName: "Equipo",
      tableName: "equipos",
    },
  );
  return Equipo;
};
