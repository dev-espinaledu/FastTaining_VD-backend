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
      });
      Jugador.hasMany(models.Historial, {
        foreignKey: "jugador_id",
        as: "historial_datos",
      });
    }
  }
  Jugador.init(
    {
      usuario_id: DataTypes.SMALLINT,
      equipo_id: DataTypes.SMALLINT,
      fecha_nacimiento: DataTypes.DATE,
      altura: DataTypes.DOUBLE,
      peso: DataTypes.DOUBLE,
      posicion: DataTypes.ENUM(
        "delantero",
        "mediocampista",
        "defensa",
        "arquero",
      ),
      porcentaje_grasa_corporal: DataTypes.DOUBLE,
      porcentaje_masa_muscular: DataTypes.DOUBLE,
      tipo_cuerpo: DataTypes.STRING,
      potencia_muscular_piernas: DataTypes.DOUBLE,
      velocidad_max: DataTypes.DOUBLE,
      resistencia_aerobica: DataTypes.DOUBLE,
      resistencia_anaerobica: DataTypes.DOUBLE,
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
