const { DatoSesion } = require("../models");

const TomarDatosEntrenamiento = async (req, res) => {
  try {
    const { fecha, objetivo, id_jugador } = req.body;
    const nuevaSesion = await DatoSesion.create({
      fecha,
      objetivo,
      id_jugador
    });

    res.json({ datos_sesion: nuevaSesion });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

module.exports = { TomarDatosEntrenamiento };
