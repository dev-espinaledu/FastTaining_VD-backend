"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
class Entrenamiento extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
    Entrenamiento.belongsTo(models.Equipo, {
        foreignKey: "equipo_id",
        as: "equipo",
    });
    Entrenamiento.belongsToMany(models.Jugador, {
        through: "EntrenamientoJugadores",
        foreignKey: "entrenamiento_id",
        as: "jugadores",
    });
    }
}

Entrenamiento.init(
    {
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Duración en minutos",
    },
    objetivo: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    },
    {
    sequelize,
    modelName: "Entrenamiento",
    tableName: "entrenamientos",
    }
);

return Entrenamiento;
};
