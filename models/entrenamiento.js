"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Entrenamiento extends Model {
    static associate(models) {
      Entrenamiento.belongsTo(models.DatoSesion, {
        foreignKey: "datos_sesion_id",
        as: "datosSesion",
      });
    }
  }
  Entrenamiento.init(
    {
      datos_sesion_id: DataTypes.SMALLINT,
      fase_inicial: DataTypes.JSONB,
      fase_central: DataTypes.JSONB,
      fase_final: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Entrenamiento",
      tableName: "entrenamientos",
    },
  );
  return Entrenamiento;
};
