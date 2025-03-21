"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Usuario extends Model {
        static associate(models) {
            
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
