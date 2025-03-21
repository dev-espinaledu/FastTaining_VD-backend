const { Calendario } = require('../models/calendario');

// Obtener el calendario actual
exports.obtenerCalendarioActual = async (req, res) => {
  try {
    // Buscar el calendario actual en la base de datos
    const calendario = await Calendario.findOne({ where: { esActual: true } });

    if (calendario) {
      return res.json(calendario);
    } else {
      return res.status(404).json({ error: "No se encontró el calendario actual" });
    }
  } catch (error) {
    console.error("Error al obtener el calendario actual:", error);
    return res.status(500).json({ error: "Error interno del servidor", message: error.message });
  }
};

// Actualizar el calendario actual
exports.actualizarCalendarioActual = async (req, res) => {
  try {
    // Buscar el calendario actual
    const calendario = await Calendario.findOne({ where: { esActual: true } });

    if (!calendario) {
      return res.status(404).json({ error: "No se encontró el calendario actual" });
    }

    // Obtener los datos del cuerpo de la solicitud
    const { posicion, fecha, objetivo, fases } = req.body;

    // Validar que se recibieron los campos necesarios
    if (!posicion || !fecha || !objetivo || !fases) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    // Actualizar el calendario con los nuevos datos
    calendario.posicion = posicion;
    calendario.fecha = fecha;
    calendario.objetivo = objetivo;
    calendario.fases = fases;

    // Guardar los cambios en la base de datos
    await calendario.save();

    // Responder con éxito
    res.json({ success: true, message: "Calendario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el calendario:", error);
    return res.status(500).json({ error: "Error al actualizar el calendario", message: error.message });
  }
};

// Obtener historial de calendarios
exports.obtenerHistorialCalendarios = async (req, res) => {
  try {
    // Obtener la página y el límite desde los parámetros de la consulta
    const { page = 1, limit = 10 } = req.query;

    // Calcular el desplazamiento (offset) para la paginación
    const offset = (page - 1) * limit;

    // Obtener el historial de calendarios (calendarios pasados)
    const historial = await Calendario.findAll({
      where: { esActual: false },
      limit: parseInt(limit), // Número de resultados por página
      offset: parseInt(offset), // Desplazamiento
    });

    res.json(historial);
  } catch (error) {
    console.error("Error al obtener el historial de calendarios:", error);
    return res.status(500).json({ error: "Error al cargar el historial", message: error.message });
  }
};
