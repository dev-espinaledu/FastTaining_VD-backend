const { Entrenador, Persona, Usuario, sequelize } = require("../models"); // Agregar sequelize para transacciones
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
  const t = await sequelize.transaction(); // Iniciar la transacción

  try {
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      await t.rollback(); // Revertir si ya existe
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const password = await bcrypt.hash(pass, 10);

    // Crear registros dentro de la transacción
    const newPersona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    const newUsuario = await Usuario.create(
      { email, password, persona_id: newPersona.id, rol_id: 2 },
      { transaction: t },
    );

    const newEntrenador = await Entrenador.create(
      { usuario_id: newUsuario.id, equipo_id },
      { transaction: t },
    );

    await t.commit(); // Confirmar transacción

    res.status(201).json({ entrenador: newEntrenador });
  } catch (e) {
    await t.rollback(); // Revertir en caso de error
    console.log(e);
    res.status(500).json({ error: "Error al crear entrenador" });
  }
};

const actualizarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;

    const entrenador = await Entrenador.findByPk(id, {
      include: [{ model: Usuario, include: [Persona] }],
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
