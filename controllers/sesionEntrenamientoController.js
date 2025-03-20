const { Sequelize } = require("sequelize");
const { PlanEntrenamiento, sequelize } = require("../models");

exports.crearEntrenamiento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { fecha, posiciones, objetivos } = req.body;
        if (!fecha || !posiciones || !objetivos || posiciones.length !== 4) {
            return res.status(400).json({ message: "Datos inválidos o incompletos" });
        }

        const planes = [];
        for (const posicion of posiciones) {
            const plan = await PlanEntrenamiento.create(
                {
                    fecha,
                    posicion,
                    objetivo: objetivos[posicion],
                },
                { transaction: t } // Se ejecuta dentro de la transacción
            );
            planes.push(plan);
        }

        await t.commit(); // Confirma la transacción si todo salió bien
        res.status(201).json({ message: "Planes creados exitosamente", planes });
    } catch (error) {
        await t.rollback(); // Revierte la transacción si hay un error
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
