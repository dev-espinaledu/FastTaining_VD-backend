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
      posicion: DataTypes.STRING,
      altura: DataTypes.SMALLINT,
      frecuencia_cardiaca: DataTypes.SMALLINT,
      peso: DataTypes.FLOAT, // en kg
      resistencia: DataTypes.SMALLINT, // vo2 max en ml/kg/min
      fuerza: DataTypes.SMALLINT, // salto vertical en cm
      velocidad: DataTypes.SMALLINT, // sprint de 30m en segundos
      potencia: DataTypes.SMALLINT, //potencia relativa en w/kg
      equipoId: {
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
