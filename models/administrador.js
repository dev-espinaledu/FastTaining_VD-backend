'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Administrador extends Model {
  static associate(models){
    Administrador.belongsTo(models.Usuario, {
      foreignKey: "usuario_id",
      as: "usuarios",
      onDelte: "CASCADE",
      onUpdate: "CASCADE"
    });
  }

}
  Administrador.init({
    usuario_id: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'Administrador',
    tableName: 'administradores'
  });
  return Administrador;
};