"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Jugador extends Model {
    static associate(models) {
      
    }
  }
  Jugador.init(
    {
      fecha_nacimiento: DataTypes.DATE,
      posicion: DataTypes.STRING,
      altura: DataTypes.SMALLINT,
    },
    {
      sequelize,
      modelName: "Jugador",
      tableName: "jugadores",
    },
  );
  return Jugador;
};
