'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DatoSesion extends Model {
    static associate(models) {

      DatoSesion.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "datos_sesions",
      });
      
      DatoSesion.hasMany(models.Entrenamiento, {
        foreignKey: "datos_sesion_id",
        as: "datosSesion",
      });
    }
  }
  DatoSesion.init({
    equipo_id:DataTypes.SMALLINT,
    fecha: DataTypes.DATE,
    objetivo: DataTypes.STRING,
    posicion: DataTypes.ENUM(
      "delantero",
      "mediocampista",
      "defensa",
      "arquero",
    ),
    altura: DataTypes.DOUBLE,
    peso: DataTypes.DOUBLE,
    porcentaje_grasa_corporal:DataTypes.DOUBLE,
    porcentaje_masa_muscular:DataTypes.DOUBLE,
    potencia_muscular_piernas:DataTypes.DOUBLE,
    velocidad:DataTypes.DOUBLE,
    resistencia_aerobica:DataTypes.DOUBLE,
    resistencia_anaerobica:DataTypes.DOUBLE,
    flexibilidad: DataTypes.DOUBLE,

  }, {
    sequelize,
    modelName: 'DatoSesion',
    tableName: 'datos_sesion'
  });
  return DatoSesion;
};