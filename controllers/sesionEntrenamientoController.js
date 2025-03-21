const { SesionEntrenamiento, Usuario } = require("../models");

// Obtener una sesión específica
exports.getSesionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sesion = await SesionEntrenamiento.findByPk(id, {
      include: [{ model: Usuario, as: "entrenador" }, { model: Usuario, as: "jugadores" }]
    });

    if (!sesion) {
      return res.status(404).json({ msg: "Sesión no encontrada" });
    }

    // Validar acceso
    const esEntrenador = sesion.entrenadorId === userId;
    const esJugador = sesion.jugadores.some((jugador) => jugador.id === userId);

    if (!esEntrenador && !esJugador) {
      return res.status(403).json({ msg: "No tienes acceso a esta sesión" });
    }

    res.json({
      id: sesion.id,
      posicion: "Delanteros", // Esto podrías sacarlo de la sesión o de otra tabla
      fecha: sesion.fecha,
      objetivo: sesion.objetivo,
      fases: sesion.fases || [
        { nombre: "Calentamiento", ejercicios: "Juego predeportivo con pelota.", duracion: "15 min" },
        { nombre: "Parte Central", ejercicios: "Circuito con jumping jacks, burpees, sentadillas, flexiones y planchas.", duracion: "15 min" },
        { nombre: "Enfriamiento", ejercicios: "Estiramientos en diferentes posiciones.", duracion: "5 min" },
      ],
    });
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};

// Actualizar una sesión de entrenamiento
exports.updateSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, objetivo, fases } = req.body;

    const sesion = await SesionEntrenamiento.findByPk(id);

    if (!sesion) {
      return res.status(404).json({ msg: "Sesión no encontrada" });
    }

    await sesion.update({ fecha, objetivo, fases });

    res.json({ msg: "Sesión actualizada correctamente", sesion });
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};
