"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Jugador extends Model {
    static associate(models) {
      Jugador.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "equipo",
      });
    }
  }
  Jugador.init(
    {
      fecha_nacimiento: DataTypes.DATE,
      altura: DataTypes.SMALLINT,
      peso: DataTypes.SMALLINT,
      posicion: DataTypes.ENUM,
      porcentaje_grasa_corporal:DataTypes.DOUBLE,
      porcentaje_grasa_muscular:DataTypes.DOUBLE,
      tipo_cuerpo:DataTypes.STRING,
      fuerza:DataTypes.SMALLINT,
      velocidad_max:DataTypes.SMALLINT ,
      resistencia:DataTypes.SMALLINT ,
      resistencia_cardiovacular:DataTypes.SMALLINT,
      resistencia_muscular:DataTypes.SMALLINT,
      flexibilidad: DataTypes.DOUBLE,
      equipo_id: {
        type: DataTypes.SMALLINT,
        references: {
          model: "equipos",
          key: "id",
        },
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Jugador",
      tableName: "jugadores",
    },
  );
  return Jugador;
};
