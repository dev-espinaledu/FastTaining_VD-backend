"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Entrenador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file llamará automáticamente a este método.
     */
    
    static associate(models) {
      // Un Entrenador pertenece a un solo Equipo
      Entrenador.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "equipo", // Alias para la relación
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
      equipo_id: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        references: {
          model: "equipos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Entrenador",
      tableName: "entrenadores",
    },
  );

  return Entrenador;
};
