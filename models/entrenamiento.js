'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entrenamiento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Entrenamiento.init({
    estiramiento: DataTypes.STRING,
    calentamiento: DataTypes.STRING,
    id_ejercicio: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'Entrenamiento',
  });
  return Entrenamiento;
};