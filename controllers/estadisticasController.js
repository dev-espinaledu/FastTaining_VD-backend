const { Sequelize } = require("sequelize");
const { Historial } = require("../models");

const obtenerEstadisticasJugador = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === "jugador" && userId !== parseInt(id)) {
    return res
      .status(403)
      .json({ error: "No tienes permisos para ver estas estadísticas" });
  }

  try {
    const estadisticas = await Historial.findAll({
      where: { jugador_id: id },
      attributes: [
        [
          Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("fecha_registro")),
          "mes",
        ],
        Sequelize.col("altura"),
        Sequelize.col("peso"),
        Sequelize.col("porcentaje_grasa_corporal"),
        Sequelize.col("porcentaje_masa_muscular"),
        Sequelize.col("fuerza"),
        Sequelize.col("velocidad_max"),
        Sequelize.col("resistencia_aerobica"),
        Sequelize.col("resistencia_anaerobica"),
        Sequelize.col("flexibilidad"),
      ],
      order: [["mes", "ASC"]],
    });

    if (!estadisticas.length) {
      return res.status(404).json({
        mensaje: "Aún no hay datos suficientes para generar estadísticas",
      });
    }

    res.json(estadisticas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las estadísticas" });
  }
};

const agregarDatosEstadisticasJugador = async (req, res) => {
  try {
    const { jugador_id } = req.params;
    const {
      fecha_registro, // TIMESTAMP WITH TIME ZONE NOT NULL
      porcentaje_grasa_corporal, // %
      porcentaje_masa_muscular, // %
      potencia_muscular_pierna, // Salto horizontal, distancia en metros
      velocidad_max, // Km/h Sprint de 30m
      resistencia_aerobica, // VO₂ máx, gráfico con  ml/kg/min
      resistencia_anaerobica, // Test de 10x40m tiempo promedio de los sprints
      flexibilidad, // Test de sit and reach. distancia alcanzada en cm
    } = req.body;

    if (!jugador_id) {
      return res.status(400).json({ error: "Se requiere un jugador" });
    }

    const nuevoRegistro = await Historial.create({
      jugador_id,
      fecha_registro: fecha_registro || new Date(),
      altura,
      peso,
      porcentaje_grasa_corporal,
      porcentaje_masa_muscular,
      potencia_muscular_pierna,
      velocidad_max,
      resistencia_aerobica,
      resistencia_anaerobica,
      flexibilidad,
    });

    res.status(201).json({
      mensaje: "Estadísticas generadas exitosamente",
      data: nuevoRegistro,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar estadísticas" });
  }
};

const estadisticasEjemplo = require("../data/estadisticasEjemplo");

// Función para generar las fechas dinámicamente
const generarFechas = (cantidad) => {
  const today = new Date();
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  let fechas = [];

  for (let i = cantidad - 1; i >= 0; i--) {
    let date = new Date(today);
    date.setMonth(today.getMonth() - i);
    fechas.push(`${meses[date.getMonth()]} ${date.getFullYear()}`);
  }

  return fechas;
};

// Función para obtener estadísticas del equipo según el período
const obtenerEstadisticasEquipo = (req, res) => {
  const { id } = req.params;
  const { periodo } = req.query; // periodo puede ser '3M', '6M', '1A'

  if (!estadisticasEjemplo[id]) {
    return res.status(404).json({ error: "Equipo no encontrado" });
  }

  let cantidadMeses = 12; // Por defecto, 1 año

  if (periodo === "3M") {
    cantidadMeses = 3;
  } else if (periodo === "6M") {
    cantidadMeses = 6;
  }

  // Obtener las últimas estadísticas según el período seleccionado
  const estadisticasFiltradas = {};
  Object.keys(estadisticasEjemplo[id]).forEach((categoria) => {
    estadisticasFiltradas[categoria] = {};
    Object.keys(estadisticasEjemplo[id][categoria]).forEach((posicion) => {
      estadisticasFiltradas[categoria][posicion] =
        estadisticasEjemplo[id][categoria][posicion].slice(-cantidadMeses);
    });
  });

  // Generar fechas correspondientes
  const fechas = generarFechas(cantidadMeses);

  res.json({ fechas, ...estadisticasFiltradas });
};

module.exports = {
  obtenerEstadisticasJugador,
  agregarDatosEstadisticasJugador,
  generarFechas,
  obtenerEstadisticasEquipo,
};
