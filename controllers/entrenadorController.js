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
    const usuarioId = req.params.id;
    
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
              attributes: ['id', 'nombre', 'apellido', 'telefono']
            }
          ],
        },
      ],
    });

    if (!entrenador || !entrenador.usuarios || !entrenador.usuarios.personas) {
      return res.status(404).json({ 
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND"
      });
    }

    const { nombre, apellido, telefono } = entrenador.usuarios.personas; // Acceder correctamente

    const camposObligatorios = { nombre, apellido, telefono };
    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (faltantes.length > 0) {
      return res.status(200).json({
        success: true,
        perfilCompleto: false,
        message: "Falta completar información del perfil",
        camposFaltantes: faltantes,
        datos: { nombre, apellido, telefono }
      });
    }

    return res.json({
      success: true,
      perfilCompleto: true,
      message: "Perfil completo",
      datos: { nombre, apellido, telefono }
    });

  } catch (error) {
    console.error("Error al ver perfil:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error al obtener perfil",
      code: "FETCH_PROFILE_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarPerfil = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuarioId = req.user.id;
    const { nombre, apellido, telefono } = req.body;

    if (!nombre || !apellido) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: "Nombre y apellido son obligatorios",
        code: "MISSING_REQUIRED_FIELDS",
        fields: ['nombre', 'apellido']
      });
    }

    if (telefono && !/^[0-9]{10,15}$/.test(telefono)) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: "Formato de teléfono inválido",
        code: "INVALID_PHONE_FORMAT"
      });
    }

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
              attributes: ['id', 'nombre', 'apellido', 'telefono']
            },
          ],
        },
      ],
      transaction: t
    });

    if (!entrenador || !entrenador.usuarios || !entrenador.usuarios.personas) {
      await t.rollback();
      return res.status(404).json({ 
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND"
      });
    }

    // Actualizar Persona usando update con where
    await Persona.update(
      {
        nombre,
        apellido,
        telefono: telefono || entrenador.usuarios.personas.telefono
      },
      {
        where: { id: entrenador.usuarios.personas.id },
        transaction: t
      }
    );

    await t.commit();
    
    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        nombre,
        apellido,
        telefono: telefono || entrenador.usuarios.personas.telefono
      }
    });

  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar perfil",
      code: "PROFILE_UPDATE_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  actualizarPerfil,
  verificarPerfilCompleto,
  obtenerEntrenadorPorUsuario
};