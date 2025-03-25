'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      this.belongsToMany(models.Permiso,{
        through: "roles_permisos",
        foreignKey:"permiso_id",
        otherKey:" rol_id",
        as:"roles"
      });
    }
  }
  Permiso.init({
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Permiso',
    tableName:'permisos'
  });
  return Permiso;
};