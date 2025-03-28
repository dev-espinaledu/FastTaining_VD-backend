module.exports = (sequelize, DataTypes) => {
    const Estadisticas = sequelize.define("Estadisticas", {
        jugador_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        altura: DataTypes.SMALLINT,
        peso: DataTypes.SMALLINT,
        porcentaje_grasa_corporal: DataTypes.DOUBLE,
        porcentaje_masa_muscular: DataTypes.DOUBLE,
        fuerza: DataTypes.SMALLINT,
        velocidad_max: DataTypes.SMALLINT,
        resistencia_aerobica: DataTypes.SMALLINT,
        resistencia_anaerobica: DataTypes.SMALLINT,
        flexibilidad: DataTypes.DOUBLE
    }, {
        tableName: "historial_datos",
        timestamps: false
    });

    return Estadisticas;
};
