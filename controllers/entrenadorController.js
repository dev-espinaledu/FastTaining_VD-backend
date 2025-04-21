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
      code: "FETCH_TRAINERS_ERROR",
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
        code: "TRAINER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: entrenador,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener entrenador",
      code: "FETCH_TRAINER_ERROR",
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
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const password = await bcrypt.hash(pass, 10);

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

    await t.commit();
    res.status(201).json({
      success: true,
      message: "Entrenador creado exitosamente",
      data: newEntrenador,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: "Error al crear entrenador",
      code: "CREATE_TRAINER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
        code: "TRAINER_NOT_FOUND",
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
      message: "Entrenador actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar entrenador",
      code: "UPDATE_TRAINER_ERROR",
      error: error.message,
    });
  }
};

const verPerfil = async (req, res) => {
  try {
    const usuarioId = req.params.id;

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
              attributes: ["nombre", "apellido", "telefono", "foto_perfil"],
            },
          ],
        },
      ],
    });

    if (!entrenador) {
      return res.status(404).json({
        success: false,
        message: "Perfil de entrenador no encontrado",
        code: "TRAINER_PROFILE_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        id: entrenador.id,
        nombre: entrenador.usuarios.personas.nombre,
        apellido: entrenador.usuarios.personas.apellido,
        telefono: entrenador.usuarios.personas.telefono,
        foto_perfil: entrenador.usuarios.personas.foto_perfil,
        usuario_id: usuarioId,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil de entrenador:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener perfil",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

// Actualizar verificarPerfilCompleto
const verificarPerfilCompleto = async (req, res) => {
  console.log("verificando el perfil del entrenador:", req.params.id);
  try {
    const usuarioId = req.params.id;

    // Buscar entrenador con usuario y persona relacionada
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
              attributes: ["nombre", "apellido", "telefono"],
            },
          ],
        },
      ],
    });

    if (!entrenador) {
      return res.status(404).json({
        success: false,
        message: "Entrenador no encontrado",
        code: "TRAINER_NOT_FOUND",
      });
    }

    // Campos requeridos para entrenador
    const camposRequeridos = {
      nombre: entrenador.usuarios.personas.nombre,
      apellido: entrenador.usuarios.personas.apellido,
      telefono: entrenador.usuarios.personas.telefono,
    };

    // Identificar campos faltantes
    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    // Datos existentes del perfil
    const profileData = {
      nombre: entrenador.usuarios.personas.nombre,
      apellido: entrenador.usuarios.personas.apellido,
      telefono: entrenador.usuarios.personas.telefono,
    };

    res.json({
      success: true,
      profileComplete: camposFaltantes.length === 0,
      missingFields: camposFaltantes,
      profileData,
    });
  } catch (error) {
    console.log("Error verificando perfil de entrenador:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al verificar perfil",
      code: "INTERNAL_SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
  obtenerEntrenadorPorUsuario,
};
