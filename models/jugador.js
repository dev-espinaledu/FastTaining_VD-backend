"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Jugador extends Model {
    static associate(models) {
      Jugador.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "equipos",
      });
      Jugador.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "usuarios",
        onUpdate: CASCADE
      });
      Jugador.hasMany(models.Historial,{
        foreignKey: "jugador_id",
        as:"historial_datos",
      });

      Jugador.hasMany(models.DatoSesion,{
        foreignKey: "jugador_id",
        as:"datos_sesion",
        onUpdate: CASCADE
      });
    }
  }
  Jugador.init(
    {
      usuario_id:DataTypes.SMALLINT,
      equipo_id: DataTypes.SMALLINT,
      fecha_nacimiento: DataTypes.DATE,
      altura: DataTypes.SMALLINT,
      peso: DataTypes.SMALLINT,
      posicion: DataTypes.ENUM("delantero", "mediocampista", "defensa", "arquero"),
      porcentaje_grasa_corporal:DataTypes.DOUBLE,
      porcentaje_masa_muscular:DataTypes.DOUBLE,
      tipo_cuerpo:DataTypes.STRING,
      fuerza:DataTypes.SMALLINT,
      velocidad_max:DataTypes.SMALLINT,
      resistencia_aerobica:DataTypes.SMALLINT,
      resistencia_anaerobica:DataTypes.SMALLINT,
      flexibilidad: DataTypes.DOUBLE,
      
    },
    {
      sequelize,
      modelName: "Jugador",
      tableName: "jugadores",
    },
  );
  return Jugador;
};
