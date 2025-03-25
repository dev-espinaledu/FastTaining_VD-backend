"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Entrenador extends Model {
    static associate(models) {

      // Un Entrenador pertenece a un solo Equipo
      Entrenador.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "equipos",
        onUpdate: "CASCADE",
      });
      Entrenador.belongsTo(models.Persona, {
        foreignKey: "persona_id",
        as: "persona",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Entrenador.init(
    {
      equipo_id: DataTypes.SMALLINT
    },
    {
      sequelize,
      modelName: "Entrenador",
      tableName: "entrenadores",
    },
  );

  return Entrenador;
};
