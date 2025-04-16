const { Entrenador, Persona, Usuario, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

const verEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.findAll({
      include: [
        { model: Persona, attributes: ["nombre", "apellido", "telefono"] },
        { model: Usuario, attributes: ["email"] },
      ],
    });
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener entrenadores",
      code: "FETCH_TRAINERS_ERROR"
    });
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
      return res.status(404).json({ 
        success: false,
        message: "Entrenador no encontrado",
        code: "TRAINER_NOT_FOUND"
      });
    }

    res.json({ 
      success: true,
      data: entrenador 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al obtener entrenador",
      code: "FETCH_TRAINER_ERROR"
    });
  }
};

const crearEntrenador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, apellido, email, pass, telefono, equipo_id } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: "El correo ya está registrado",
        code: "EMAIL_ALREADY_EXISTS"
      });
    }

    const password = await bcrypt.hash(pass, 10);

    const newPersona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t }
    );

    const newUsuario = await Usuario.create(
      { email, password, persona_id: newPersona.id, rol_id: 2 },
      { transaction: t }
    );

    const newEntrenador = await Entrenador.create(
      { usuario_id: newUsuario.id, equipo_id },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ 
      success: true,
      message: "Entrenador creado exitosamente",
      data: newEntrenador 
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      success: false,
      message: "Error al crear entrenador",
      code: "CREATE_TRAINER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      return res.status(404).json({ 
        success: false,
        message: "Entrenador no encontrado",
        code: "TRAINER_NOT_FOUND"
      });
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

    res.json({ 
      success: true,
      message: "Entrenador actualizado correctamente" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar entrenador",
      code: "UPDATE_TRAINER_ERROR",
      error: error.message 
    });
  }
};

const verPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const entrenador = await Entrenador.findOne({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "usuarios",
          include: [
            {
              model: Persona,
              as: "personas",
              attributes: ["nombre", "apellido", "telefono", "foto_perfil"]
            }
          ]
        }
      ]
    });

    if (!entrenador) {
      return res.status(404).json({
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: {
        nombre: entrenador.usuarios.personas.nombre,
        apellido: entrenador.usuarios.personas.apellido,
        telefono: entrenador.usuarios.personas.telefono,
        foto_perfil: entrenador.usuarios.personas.foto_perfil
      }
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
      code: "FETCH_PROFILE_ERROR"
    });
  }
};

const verificarPerfilCompleto = async (req, res) => {
  try {
    const usuarioId = req.user.id; // Obtiene el ID del token

    const entrenador = await Entrenador.findOne({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          include: [
            {
              model: Persona,
              as: 'personas',
              attributes: ['nombre', 'apellido', 'telefono']
            }
          ]
        }
      ]
    });

    if (!entrenador || !entrenador.usuarios || !entrenador.usuarios.personas) {
      return res.json({ 
        success: true,
        profileComplete: false
      });
    }

    const { nombre, apellido, telefono } = entrenador.usuarios.personas;
    const camposRequeridos = { nombre, apellido, telefono };
    const perfilCompleto = Object.values(camposRequeridos).every(val => val);

    res.json({ 
      success: true,
      profileComplete: perfilCompleto
    });

  } catch (error) {
    console.error("Error verificando perfil:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al verificar perfil"
    });
  }
};

const obtenerEntrenadorPorUsuario = async (req, res) => {
  const { id } = req.params;
  const entrenador = await Entrenador.findOne({ where: { usuario_id: id } });
  res.json(entrenador);
};

module.exports = { 
  verEntrenadores, 
  crearEntrenador, 
  verEntrenador, 
  actualizarEntrenador, 
  verPerfil, 
  verificarPerfilCompleto,
  obtenerEntrenadorPorUsuario
};