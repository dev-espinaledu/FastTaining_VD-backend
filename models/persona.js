"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      this.hasOne(models.Usuario, {
        foreignKey: "persona_id",
        as: "usuarios", 
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
      foto_perfil: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Persona",
      tableName: "personas",
    },
  );
  return Persona;
};
