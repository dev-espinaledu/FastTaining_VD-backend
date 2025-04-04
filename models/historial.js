'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Historial extends Model {
  static associate(models){
    Historial.belongsTo(models.Jugador, {
      foreignKey: "jugador_id",
      as: "jugador",
    });

  }

}
  Historial.init({
    fecha_registro: DataTypes.DATE,
    porcentaje_grasa_corporal:DataTypes.DOUBLE,
    porcentaje_masa_muscular:DataTypes.DOUBLE,
    potencia_muscular_piernas:DataTypes.DOUBLE,
    velocidad_max:DataTypes.DOUBLE,
    resistencia_aerobica:DataTypes.DOUBLE,
    resistencia_anaerobica:DataTypes.DOUBLE,
    flexibilidad: DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'Historial',
    tableName: 'historial_datos'
  });
  return Historial;
};