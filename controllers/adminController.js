const { Administrador, Persona, Usuario, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

const verAdministradores = async (req, res) => {
  try {
    const administradores = await Administrador.findAll({
      include: [
        {
          model: Usuario,
          as: "usuarios", // Alias correcto según modelo
          attributes: ["email"],
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

    res.json({
      success: true,
      data: administradores.map((a) => ({
        id: a.id,
        nombre: a.usuarios?.personas?.nombre || "Desconocido",
        apellido: a.usuarios?.personas?.apellido || "Desconocido",
        email: a.usuarios?.email || "Sin correo",
        telefono: a.usuarios?.personas?.telefono || "",
      })),
    });
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener administradores",
      code: "FETCH_ADMINS_ERROR",
    });
  }
};

const verAdministrador = async (req, res) => {
  try {
    const { id } = req.params;
    const administrador = await Administrador.findByPk(id, {
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

    if (!administrador) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
        code: "ADMIN_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        id: administrador.id,
        nombre: administrador.usuarios?.personas?.nombre,
        apellido: administrador.usuarios?.personas?.apellido,
        email: administrador.usuarios?.email,
        telefono: administrador.usuarios?.personas?.telefono,
      },
    });
  } catch (error) {
    console.error("Error al obtener administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener administrador",
      code: "FETCH_ADMIN_ERROR",
    });
  }
};

const crearAdministrador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, apellido, telefono, email, pass } = req.body;

    if (!email || !pass) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    const emailExiste = await Usuario.findOne({ where: { email } });
    if (emailExiste) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "El correo ya está registrado",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const password = await bcrypt.hash(pass, 10);

    const persona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    const usuario = await Usuario.create(
      {
        email,
        password,
        persona_id: persona.id,
        rol_id: 1, // Rol de administrador
      },
      { transaction: t },
    );

    const administrador = await Administrador.create(
      {
        usuario_id: usuario.id,
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({
      success: true,
      message: "Administrador creado exitosamente",
      data: {
        id: administrador.id,
        nombre,
        apellido,
        email,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear administrador",
      code: "CREATE_ADMIN_ERROR",
    });
  }
};

const actualizarAdministrador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, apellido, telefono, email, pass } = req.body;
    const usuarioId = req.user.id; // Obtener ID del usuario autenticado

    // Buscar administrador por usuario_id en lugar de id
    const administrador = await Administrador.findOne({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "usuarios",
          include: [
            {
              model: Persona,
              as: "personas",
            },
          ],
        },
      ],
      transaction: t,
    });

    if (
      !administrador ||
      !administrador.usuarios ||
      !administrador.usuarios.personas
    ) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
        code: "ADMIN_NOT_FOUND",
      });
    }

    // Actualizar datos de persona
    await administrador.usuarios.personas.update(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    if (email) {
      await administrador.usuarios.update({ email }, { transaction: t });
    }

    if (pass) {
      const password = await bcrypt.hash(pass, 10);
      await administrador.usuarios.update({ password }, { transaction: t });
    }

    await t.commit();
    res.json({
      success: true,
      message: "Administrador actualizado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar administrador",
      code: "UPDATE_ADMIN_ERROR",
    });
  }
};

const eliminarAdministrador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const administrador = await Administrador.findByPk(id, { transaction: t });
    if (!administrador) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
        code: "ADMIN_NOT_FOUND",
      });
    }

    await administrador.destroy({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: "Administrador eliminado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar administrador",
      code: "DELETE_ADMIN_ERROR",
    });
  }
};

// Funciones específicas para el perfil
const verPerfil = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    console.log(usuarioId);

    const administrador = await Administrador.findOne({
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

    console.log(administrador);

    if (!administrador) {
      return res.status(404).json({
        success: false,
        message: "Perfil de administrador no encontrado",
        code: "ADMIN_PROFILE_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        id: administrador.id,
        nombre: administrador.usuarios.personas.nombre,
        apellido: administrador.usuarios.personas.apellido,
        telefono: administrador.usuarios.personas.telefono,
        foto_perfil: administrador.usuarios.personas.foto_perfil,
        usuario_id: usuarioId,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil de administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener perfil",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const verificarPerfilCompleto = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Buscar admin con usuario y persona relacionada
    const administrador = await Administrador.findOne({
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
    console.log(administrador);

    if (!administrador) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
        code: "ADMIN_NOT_FOUND",
      });
    }

    // Campos requeridos para admin
    const camposRequeridos = {
      nombre: administrador.usuarios.personas.nombre,
      apellido: administrador.usuarios.personas.apellido,
      telefono: administrador.usuarios.personas.telefono,
    };

    // Identificar campos faltantes
    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    // Datos existentes del perfil
    const profileData = {
      nombre: administrador.usuarios.personas.nombre,
      apellido: administrador.usuarios.personas.apellido,
      telefono: administrador.usuarios.personas.telefono,
    };

    res.json({
      success: true,
      profileComplete: camposFaltantes.length === 0,
      missingFields: camposFaltantes,
      profileData,
    });
  } catch (error) {
    console.error("Error verificando perfil de administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al verificar perfil",
      code: "INTERNAL_SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const obtenerIdAdministradorConUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const administrador = await Administrador.findOne({
      where: { usuario_id: id },
      attributes: ["id"],
    });

    if (!administrador) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado",
        code: "ADMIN_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      id: administrador.id,
    });
  } catch (error) {
    console.error("Error al obtener administrador por usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener administrador",
      code: "FETCH_ADMIN_ERROR",
    });
  }
};

module.exports = {
  verAdministradores,
  verAdministrador,
  crearAdministrador,
  actualizarAdministrador,
  eliminarAdministrador,
  verPerfil,
  verificarPerfilCompleto,
  obtenerIdAdministradorConUsuario,
};
