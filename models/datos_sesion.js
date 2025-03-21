'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class datos_sesion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  datos_sesion.init({
    fecha: DataTypes.DATE,
    objetivo: DataTypes.STRING,
    id_jugador: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'datos_sesion',
  });
  return datos_sesion;
};