"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación 1 a 1 con Usuario
      this.hasOne(models.Usuario, {
        foreignKey: "persona_id",
        as: "usuario", // Alias para la relación
        onDelete: "CASCADE", // Si se elimina la persona, el usuario asociado también se elimina
        onUpdate: "CASCADE",
      });
      this.hasOne(models.Jugador, {
        foreignKey: "id",
        as: "jugador",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Persona.init(
    {
      nombre: DataTypes.STRING,
      apellido: DataTypes.STRING,
      telefono: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Persona",
      tableName: "personas",
    },
  );
  return Persona;
};
