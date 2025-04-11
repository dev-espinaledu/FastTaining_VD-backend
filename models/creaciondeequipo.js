'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CreacionDeEquipo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CreacionDeEquipo.init({
    nombre: DataTypes.STRING,
    categoria: DataTypes.STRING,
    imagen: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CreacionDeEquipo',
  });
  return CreacionDeEquipo;
};