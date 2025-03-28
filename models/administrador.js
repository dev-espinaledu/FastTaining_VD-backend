'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Administrador extends Model {
  static associate(models){
    Administrador.belongsTo(models.Usuario, {
      foreignKey: "usuario_id",
      as: "administradores",
    });
  }

}
  Administrador.init({
    usuario_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Administrador',
    tableName: 'administradores'
  });
  return Administrador;
};