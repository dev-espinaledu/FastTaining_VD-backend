const { DatoSesion } = require("../models");

const TomarDatosEntrenamiento = async (req, res) => {
  try {
    const { fecha, objetivo, jugador_id } = req.body;
    const nuevaSesion = await DatoSesion.create({
      fecha,
      objetivo,
      jugador_id
    });

    res.json({ datos_sesion: nuevaSesion });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

module.exports = { TomarDatosEntrenamiento };
