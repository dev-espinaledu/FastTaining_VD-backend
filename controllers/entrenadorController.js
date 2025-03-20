const { Entrenador } = require("../models");
const { Persona } = require("../models");
const { Usuario } = require("../models");
const bcrypt = require("bcrypt");

const verEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.findAll();
    res.json(entrenadores);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const verEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const entrenador = await Entrenador.findByPk(id);
    if (!entrenador) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    res.json(entrenador);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const crearEntrenador = async (req, res) => {
  try {
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;
    const password = await bcrypt.hash(pass, 10);
    const newPersona = await Persona.create({ nombre, apellido, telefono });
    const newUsuario = await Usuario.create({
      email,
      password,
      persona_id: newPersona.id,
      rol_id: 3,
    });
    const newEntrenador = await Entrenador.create({
      equipo_id,
    });

    res.json({ entrenador: newEntrenador });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const actualizarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;

    const entrenador = await Entrenador.findByPk(id, {
      include: [{ model: Usuario, include: [Persona] }]
    });

    if (!entrenador) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    await entrenador.Usuario.Persona.update({ nombre, apellido, telefono });

    if (email) {
      await entrenador.Usuario.update({ email });
    }

    if (pass) {
      const password = await bcrypt.hash(pass, 10);
      await entrenador.Usuario.update({ password });
    }

    if (equipo_id) {
      await entrenador.update({ equipo_id });
    }

    res.json({ mensaje: "Entrenador actualizado correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


module.exports = { verEntrenadores, crearEntrenador, verEntrenador, actualizarEntrenador };
