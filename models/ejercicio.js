'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ejercicio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ejercicio.init({
    ejercicio: DataTypes.STRING,
    repeticiones: DataTypes.STRING,
    series: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ejercicio',
  });
  return ejercicio;
};