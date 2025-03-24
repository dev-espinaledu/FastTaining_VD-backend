"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Usuario extends Model {
        static associate(models) {
            Usuario.belongsTo(models.Persona, {
                foreignKey: "persona_id",
                as: "personas",
            });
            Usuario.belongsTo(models.Rol, {
                foreignKey: "rol_id",
                as: "roles",
            });
            Jugador.hasOne(models.Entrenador, {
                foreignKey: "usuario_id",
                as: "entrenadores",
            });
            Jugador.hasOne(models.Jugador, {
                foreignKey: "usuario_id",
                as: "jugadores",
            });
            Jugador.hasOne(models.Administrador, {
                foreignKey: "usuario_id",
                as: "administradores",
            });

        }
    }
    Usuario.init({
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        persona_id: DataTypes.SMALLINT,
        rol_id: DataTypes.SMALLINT,
    },
    { 
        sequelize,
        modelName: "Usuario",
        tableName: "usuarios",
    },
    ); 
    return Usuario;
};
