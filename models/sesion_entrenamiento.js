"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Entrenamiento extends Model {
    static associate(models) {
      Entrenamiento.belongsTo(models.Jugador, { foreignKey: "jugador_id" });
    }
  }
  Entrenamiento.init(
    {
      jugador_id: DataTypes.SMALLINT,
      fase_inicial: DataTypes.JSONB,
      fase_central: DataTypes.JSONB,
      fase_final: DataTypes.JSONB,
      fecha: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Entrenamiento",
      tableName: "entrenamientos",
    },
  );
  return Entrenamiento;
};
