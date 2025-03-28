const { Equipo, Jugador } = require("../models");

const verEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.findAll();
    res.json(equipos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const verEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findByPk(id, {
      include: [{ model: Jugador, as: "jugadores" }], // Relación con jugadores
    });

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.json(equipo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const crearEquipo = async (req, res) => {
  try {
    const { nombre, escudo_url } = req.body;
    const nuevoEquipo = await Equipo.create({
      nombre,
      escudo_url,
    });

    res.json({ equipo: nuevoEquipo });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

module.exports = { verEquipos, crearEquipo, verEquipo };
