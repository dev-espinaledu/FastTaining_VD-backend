const { Sequelize } = require('sequelize');
const { Estadisticas } = require('../models');

exports.obtenerEstadisticas = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'jugador' && userId !== parseInt(id)) {
        return res.status(403).json({ error: 'No tienes permisos para ver estas estadísticas' });
    }

    try {
        const estadisticas = await Estadisticas.findAll({
            where: { jugador_id: id },
            attributes: [
                [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('fecha_registro')), 'mes'],
                Sequelize.col('altura'),
                Sequelize.col('peso'),
                Sequelize.col('porcentaje_grasa_corporal'),
                Sequelize.col('porcentaje_masa_muscular'),
                Sequelize.col('fuerza'),
                Sequelize.col('velocidad_max'),
                Sequelize.col('resistencia_aerobica'),
                Sequelize.col('resistencia_anaerobica'),
                Sequelize.col('flexibilidad')
            ],
            order: [['mes', 'ASC']]
        });

        if (!estadisticas.length) {
            return res.status(404).json({ mensaje: "Aún no hay datos suficientes para generar estadísticas" });
        }

        res.json(estadisticas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las estadísticas" });
    }
};

exports.generarEstadisticas = async (req, res) => {
    try {
        const {
            jugador_id, altura, peso, porcentaje_grasa_corporal,
            porcentaje_masa_muscular, fuerza, velocidad_max,
            resistencia_aerobica, resistencia_anaerobica, flexibilidad
        } = req.body;

        if (!jugador_id) {
            return res.status(400).json({ error: 'Se requiere un jugador' });
        }

        const nuevoRegistro = await Estadisticas.create({
            jugador_id,
            fecha_registro: new Date(),
            altura,
            peso,
            porcentaje_grasa_corporal,
            porcentaje_masa_muscular,
            fuerza,
            velocidad_max,
            resistencia_aerobica,
            resistencia_anaerobica,
            flexibilidad
        });

        res.status(201).json({ mensaje: 'Estadísticas generadas exitosamente', data: nuevoRegistro });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar estadísticas" });
    }
};
