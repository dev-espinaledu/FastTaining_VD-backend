"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      
      // Relación 1 a 1 con Usuario
      this.hasOne(models.Usuario, {
        foreignKey: "persona_id",
        as: "usuarios", 
        onDelete: "CASCADE", 
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
