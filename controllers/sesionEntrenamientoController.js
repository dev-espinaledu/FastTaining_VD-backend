const { SesionEntrenamiento, Usuario } = require("../models");

// Obtener detalles de una sesión específica
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

    // Validar acceso (el usuario debe ser entrenador o estar en la lista de jugadores)
    const esEntrenador = sesion.entrenadorId === userId;
    const esJugador = sesion.jugadores.some((jugador) => jugador.id === userId);

    if (!esEntrenador && !esJugador) {
      return res.status(403).json({ msg: "No tienes acceso a esta sesión" });
    }

    res.json(sesion);
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};

// Obtener sesiones asignadas a un entrenador
exports.getSesionesByEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sesiones = await SesionEntrenamiento.findAll({
      where: { entrenadorId: id },
      include: [{ model: Usuario, as: "jugadores" }]
    });

    res.json(sesiones);
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};
