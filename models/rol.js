"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación 1 a 1 con Usuario
      this.hasOne(models.Usuario, {
        foreignKey: "rol_id",
        as: "usuario",
        onDelete: "SET NULL", // Si se elimina el rol, el usuario mantiene la clave nula
        onUpdate: "CASCADE",
      });
    }
  }
  Rol.init(
    {
      nombre: DataTypes.ENUM("admin", "jugador", "entrenador"),
    },
    {
      sequelize,
      modelName: "Rol",
      tableName: "roles",
    },
  );
  return Rol;
};
