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
    jugador_id: DataTypes.STRING,
    fecha_registro: DataTypes.DATE,
    altura: DataTypes.SMALLINT,
    peso: DataTypes.SMALLINT,
    porcentaje_grasa_corporal:DataTypes.DOUBLE,
    porcentaje_masa_muscular:DataTypes.DOUBLE,
    fuerza:DataTypes.SMALLINT,
    velocidad_max:DataTypes.SMALLINT,
    resistencia_aerobica:DataTypes.SMALLINT,
    resistencia_anaerobica:DataTypes.SMALLINT,
    flexibilidad: DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'Historial',
    tableName: 'historial_datos'
  });
  return Historial;
};