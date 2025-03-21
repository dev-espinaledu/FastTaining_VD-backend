const { Entrenador, Persona, Usuario } = require("../models");
const bcrypt = require("bcrypt");

const verEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.findAll({
      include: [
        { model: Persona, attributes: ["nombre", "apellido", "telefono"] },
        { model: Usuario, attributes: ["email"] },
      ],
    });
    res.json(entrenadores);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener entrenadores" });
  }
};

const verEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const entrenador = await Entrenador.findByPk(id, {
      include: [
        { model: Persona, attributes: ["nombre", "apellido", "telefono"] },
        { model: Usuario, attributes: ["email"] },
      ],
    });

    if (!entrenador) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    res.json(entrenador);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener entrenador" });
  }
};

const crearEntrenador = async (req, res) => {
  try {
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const password = await bcrypt.hash(pass, 10);

    const newEntrenador = await Entrenador.sequelize.transaction(async (t) => {
      const newPersona = await Persona.create(
        { nombre, apellido, telefono },
        { transaction: t },
      );

      const newUsuario = await Usuario.create(
        { email, password, persona_id: newPersona.id, rol_id: 2 },
        { transaction: t },
      );
      return await Entrenador.create(
        { persona_id: newPersona.id, equipo_id },
        { transaction: t },
      );
    });

    res.status(201).json({ entrenador: newEntrenador });
  } catch (e) {
    res.status(500).json({ error: "Error al crear entrenador" });
  }
};

module.exports = { verEntrenadores, crearEntrenador, verEntrenador };
