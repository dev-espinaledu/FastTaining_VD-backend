const { Promedio, Equipo, Jugador, Historial, sequelize } = require("../models");
const { Sequelize } = require("sequelize");

const agregarPromediosPorFechas = async (req, res) => {
    try {
      const fechas = [
        "2023-01-15 10:00:00+00",
        "2023-03-15 10:00:00+00",
        "2023-05-15 10:00:00+00",
        "2023-07-15 10:00:00+00",
        "2023-09-15 10:00:00+00",
        "2023-11-15 10:00:00+00",
        "2024-01-15 10:00:00+00",
        "2024-03-15 10:00:00+00",
        "2024-05-15 10:00:00+00",
        "2024-07-15 10:00:00+00",
        "2024-09-15 10:00:00+00",
        "2024-11-15 10:00:00+00",
      ];
  
      for (const fecha of fechas) {
        const promedios = await Historial.findAll({
          attributes: [
            [sequelize.fn("AVG", sequelize.col("Historial.velocidad_max")), "velocidad_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.porcentaje_grasa_corporal")), "grasa_corporal_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.porcentaje_masa_muscular")), "masa_muscular_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.potencia_muscular_piernas")), "potencia_muscular_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.resistencia_aerobica")), "resistencia_aerobica_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.resistencia_anaerobica")), "resistencia_anaerobica_prom"],
            [sequelize.fn("AVG", sequelize.col("Historial.flexibilidad")), "flexibilidad_prom"],
            [sequelize.col("jugador.posicion"), "posicion"],
            [sequelize.col("jugador.equipo_id"), "equipo_id"],
          ],
          include: [
            {
              model: Jugador,
              as: "jugador",
              attributes: [], // no incluir atributos redundantes aquí
            },
          ],
          where: {
            fecha_registro: fecha,
          },
          group: ["jugador.posicion", "jugador.equipo_id"],
          raw: false,
          nest: true,
        });
  
        for (const promedio of promedios) {
          await Promedio.create({
            posicion: promedio.dataValues.posicion,
            fecha_registro: fecha,
            velocidad_prom: promedio.dataValues.velocidad_prom,
            grasa_corporal_prom: promedio.dataValues.grasa_corporal_prom,
            masa_muscular_prom: promedio.dataValues.masa_muscular_prom,
            potencia_muscular_prom: promedio.dataValues.potencia_muscular_prom,
            resistencia_aerobica_prom: promedio.dataValues.resistencia_aerobica_prom,
            resistencia_anaerobica_prom: promedio.dataValues.resistencia_anaerobica_prom,
            flexibilidad_prom: promedio.dataValues.flexibilidad_prom,
            equipo_id: promedio.dataValues.equipo_id || null,
          });
        }
      }
  
      res.status(201).json({ message: "✅ Promedios agregados correctamente por posición y fechas." });
    } catch (error) {
      console.error("❌ Error al agregar promedios:", error);
      res.status(500).json({ error: "Error al agregar promedios por posición y fechas." });
    }
  };

const PromediarDatos = async (req, res) => {
    try {
        const { equipoId } = req.params;
        const jugadores = await Jugador.findAll({ where: { equipoId } });
        const promedios = [];

        for (const jugador of jugadores) {
            const promedio = await Promedio.findOne({ where: { jugadorId: jugador.id } });
            if (promedio) {
                promedios.push(promedio);
            }
        }

        res.status(200).json(promedios);
    } catch (error) {
        console.error("Error al obtener los promedios:", error);
        res.status(500).json({ error: "Error al obtener los promedios" });
    }
};

const agregarPromediosPorPosicion = async (req, res) => {
    try {
        // Obtener los promedios de estadísticas agrupados por posición
        const promedios = await Jugador.findAll({
            attributes: [
                'posicion',
                [sequelize.fn('AVG', sequelize.col('velocidad')), 'velocidad_prom'],
                [sequelize.fn('AVG', sequelize.col('altura')), 'altura_prom'],
                [sequelize.fn('AVG', sequelize.col('peso')), 'peso_prom'],
                [sequelize.fn('AVG', sequelize.col('grasa_corporal')), 'grasa_corporal_prom'],
                [sequelize.fn('AVG', sequelize.col('masa_muscular')), 'masa_muscular_prom'],
                [sequelize.fn('AVG', sequelize.col('potencia_muscular')), 'potencia_muscular_prom'],
                [sequelize.fn('AVG', sequelize.col('resistencia_aerobica')), 'resistencia_aerobica_prom'],
                [sequelize.fn('AVG', sequelize.col('resistencia_anaerobica')), 'resistencia_anaerobica_prom'],
                [sequelize.fn('AVG', sequelize.col('flexibilidad')), 'flexibilidad_prom'],
            ],
            group: ['posicion'],
        });

        // Guardar los promedios en la tabla `Promedio`
        for (const promedio of promedios) {
            await Promedio.create({
                posicion: promedio.posicion,
                velocidad_pron: promedio.dataValues.velocidad_prom,
                altura_prom: promedio.dataValues.altura_prom,
                peso_prom: promedio.dataValues.peso_prom,
                grasa_corporal_prom: promedio.dataValues.grasa_corporal_prom,
                masa_muscular_prom: promedio.dataValues.masa_muscular_prom,
                potencia_muscular_prom: promedio.dataValues.potencia_muscular_prom,
                resistencia_aerobica_prom: promedio.dataValues.resistencia_aerobica_prom,
                resistencia_anaerobica_prom: promedio.dataValues.resistencia_anaerobica_prom,
                flexibilidad_prom: promedio.dataValues.flexibilidad_prom,
                fecha_registro: new Date(),
            });
        }

        res.status(201).json({ message: "Promedios por posición agregados exitosamente" });
    } catch (error) {
        console.error("❌ Error al agregar promedios por posición:", error);
        res.status(500).json({ error: "Error al agregar promedios por posición" });
    }
};

const obtenerPromedioEstadisticas = async (req, res) => {
    const { posicion, metrica } = req.query;
  
    const metricasValidas = [
      "porcentaje_grasa_corporal",
      "porcentaje_masa_muscular",
      "potencia_muscular_piernas",
      "velocidad_max",
      "resistencia_aerobica",
      "resistencia_anaerobica",
      "flexibilidad"
    ];
  
    if (!metricasValidas.includes(metrica)) {
      return res.status(400).json({ error: "Métrica no válida" });
    }
  
    try {
      const resultados = await Historial.findAll({
        include: [{
          model: Jugador,
          where: { posicion },
          attributes: [] // no queremos campos adicionales
        }],
        attributes: [
          [
            Sequelize.fn("to_char", 
              Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("fecha_registro")), 
              "YYYY-MM-DD"
            ), "mes"
          ],
          [Sequelize.fn("AVG", Sequelize.col(metrica)), "promedio"]
        ],
        group: [Sequelize.literal("mes")],
        order: [[Sequelize.literal("mes"), "ASC"]],
        raw: true
      });
  
      const labels = resultados.map(r => {
        const fecha = new Date(r.mes);
        return `${fecha.toLocaleString('es', { month: 'short' })} ${fecha.getFullYear()}`;
      });
  
      const valores = resultados.map(r => parseFloat(r.promedio).toFixed(2));
  
      res.json({ labels, data: valores, metrica });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener estadísticas promedio" });
    }
  };

  const obtenerEstadisticasPromedioTodas = async (req, res) => {
    const { posicion } = req.query;
  
    if (!posicion) {
      return res.status(400).json({ error: "Posición requerida" });
    }
  
    try {
      const estadisticas = await Historial.findAll({
        include: {
          model: Jugador,
          where: { posicion },
          attributes: [] // solo se usa para filtrar
        },
        attributes: [
          [Sequelize.fn("to_char", Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("fecha_registro")), "YYYY-MM-DD"), "mes"],
          [Sequelize.fn("AVG", Sequelize.col("porcentaje_grasa_corporal")), "porcentaje_grasa_corporal"],
          [Sequelize.fn("AVG", Sequelize.col("porcentaje_masa_muscular")), "porcentaje_masa_muscular"],
          [Sequelize.fn("AVG", Sequelize.col("potencia_muscular_piernas")), "potencia_muscular_piernas"],
          [Sequelize.fn("AVG", Sequelize.col("velocidad_max")), "velocidad_max"],
          [Sequelize.fn("AVG", Sequelize.col("resistencia_aerobica")), "resistencia_aerobica"],
          [Sequelize.fn("AVG", Sequelize.col("resistencia_anaerobica")), "resistencia_anaerobica"],
          [Sequelize.fn("AVG", Sequelize.col("flexibilidad")), "flexibilidad"]
        ],
        group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("fecha_registro"))],
        order: [[Sequelize.col("mes"), "ASC"]],
        raw: true
      });
  
      if (!estadisticas.length) {
        return res.status(404).json({ mensaje: "No hay datos suficientes" });
      }
  
      const meses = estadisticas.map(stat => {
        const fecha = new Date(stat.mes);
        return `${fecha.toLocaleString("es", { month: "short" })} ${fecha.getFullYear()}`;
      });
  
      const datosFormateados = {
        labels: meses,
        datasets: {
          porcentaje_grasa_corporal: estadisticas.map(e => parseFloat(e.porcentaje_grasa_corporal)),
          porcentaje_masa_muscular: estadisticas.map(e => parseFloat(e.porcentaje_masa_muscular)),
          potencia_muscular_piernas: estadisticas.map(e => parseFloat(e.potencia_muscular_piernas)),
          velocidad_max: estadisticas.map(e => parseFloat(e.velocidad_max)),
          resistencia_aerobica: estadisticas.map(e => parseFloat(e.resistencia_aerobica)),
          resistencia_anaerobica: estadisticas.map(e => parseFloat(e.resistencia_anaerobica)),
          flexibilidad: estadisticas.map(e => parseFloat(e.flexibilidad))
        },
        unidades: {
          porcentaje_grasa_corporal: '%',
          porcentaje_masa_muscular: '%',
          potencia_muscular_piernas: 'm',
          velocidad_max: 'Km/h',
          resistencia_aerobica: 'ml/kg/min',
          resistencia_anaerobica: 'seg',
          flexibilidad: 'cm'
        }
      };
  
      res.json(datosFormateados);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener estadísticas promedio" });
    }
  };
  
  const obtenerEstadisticasPorTodasLasPosiciones = async (req, res) => {
    try {
      const estadisticas = await Historial.findAll({
        include: [
          {
            model: Jugador,
            as: 'jugador',
            attributes: [],
          },
        ],
        attributes: [
          [
            Sequelize.fn(
              "to_char",
              Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("Historial.fecha_registro")),
              "YYYY-MM-DD"
            ),
            "mes"
          ],
          [Sequelize.col("jugador.posicion"), "posicion"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.porcentaje_grasa_corporal")), "porcentaje_grasa_corporal"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.porcentaje_masa_muscular")), "porcentaje_masa_muscular"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.potencia_muscular_piernas")), "potencia_muscular_piernas"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.velocidad_max")), "velocidad_max"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.resistencia_aerobica")), "resistencia_aerobica"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.resistencia_anaerobica")), "resistencia_anaerobica"],
          [Sequelize.fn("AVG", Sequelize.col("Historial.flexibilidad")), "flexibilidad"],
        ],
        group: [
          Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("Historial.fecha_registro")),
          Sequelize.col("jugador.posicion"),
        ],
        order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("Historial.fecha_registro")), "ASC"]],
        raw: true,
      });
  
      if (!estadisticas.length) {
        return res.status(404).json({ mensaje: "No hay datos suficientes" });
      }
  
      const datosPorPosicion = {};
      const etiquetas = new Set();
  
      estadisticas.forEach(stat => {
        const posicion = stat["posicion"];
        const fecha = new Date(stat.mes);
        const mesLabel = `${fecha.toLocaleString("es", { month: "short" })} ${fecha.getFullYear()}`;
        etiquetas.add(mesLabel);
  
        if (!datosPorPosicion[posicion]) {
          datosPorPosicion[posicion] = {
            porcentaje_grasa_corporal: [],
            porcentaje_masa_muscular: [],
            potencia_muscular_piernas: [],
            velocidad_max: [],
            resistencia_aerobica: [],
            resistencia_anaerobica: [],
            flexibilidad: [],
          };
        }
  
        datosPorPosicion[posicion].porcentaje_grasa_corporal.push(parseFloat(stat.porcentaje_grasa_corporal));
        datosPorPosicion[posicion].porcentaje_masa_muscular.push(parseFloat(stat.porcentaje_masa_muscular));
        datosPorPosicion[posicion].potencia_muscular_piernas.push(parseFloat(stat.potencia_muscular_piernas));
        datosPorPosicion[posicion].velocidad_max.push(parseFloat(stat.velocidad_max));
        datosPorPosicion[posicion].resistencia_aerobica.push(parseFloat(stat.resistencia_aerobica));
        datosPorPosicion[posicion].resistencia_anaerobica.push(parseFloat(stat.resistencia_anaerobica));
        datosPorPosicion[posicion].flexibilidad.push(parseFloat(stat.flexibilidad));
      });
  
      res.json({
        labels: Array.from(etiquetas),
        por_posicion: datosPorPosicion,
        unidades: {
          porcentaje_grasa_corporal: "%",
          porcentaje_masa_muscular: "%",
          potencia_muscular_piernas: "m",
          velocidad_max: "Km/h",
          resistencia_aerobica: "ml/kg/min",
          resistencia_anaerobica: "seg",
          flexibilidad: "cm"
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener estadísticas por posición" });
    }
  };
  

module.exports = { PromediarDatos, agregarPromediosPorPosicion, agregarPromediosPorFechas, obtenerPromedioEstadisticas, obtenerEstadisticasPromedioTodas, obtenerEstadisticasPorTodasLasPosiciones };