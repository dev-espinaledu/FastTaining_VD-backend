'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promedio extends Model {
  static associate(models){
    Promedio.belongsTo(models.Jugador, {
      foreignKey: "equipo_id",
      as: "equipos",
    });

  }
}
  Promedio.init({
    equipo_id: DataTypes.SMALLINT,
    fecha_registro: DataTypes.DATE,
    posicion: DataTypes.STRING,
    grasa_corporal_prom:DataTypes.DOUBLE,
    masa_muscular_prom:DataTypes.DOUBLE,
    potencia_muscular_prom:DataTypes.DOUBLE,
    velocidad_prom:DataTypes.DOUBLE,
    resistencia_aerobica_prom:DataTypes.DOUBLE,
    resistencia_anaerobica_prom:DataTypes.DOUBLE,
    flexibilidad_prom: DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'Promedio',
    tableName: 'promedio_datos'
  });
  return Promedio;
};