const { Usuario, Persona, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

const obtenerUsuarioActual= async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "No autenticado",
        code: "UNAUTHORIZED"
      });
    }

    // Obtener usuario con sus datos de persona
    const usuario = await Usuario.findByPk(req.user.id, {
      include: [
        { 
          model: Persona,
          as: 'personas',
          attributes: ['id', 'nombre', 'apellido', 'telefono', 'foto_perfil']
        }
      ],
      attributes: ['id', 'email', 'rol_id']
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Formatear respuesta
    const responseData = {
      id: usuario.id,
      email: usuario.email,
      rol_id: usuario.rol_id,
      nombre: usuario.personas?.nombre || null,
      apellido: usuario.personas?.apellido || null,
      telefono: usuario.personas?.telefono || null,
      foto_perfil: usuario.personas?.foto_perfil || null
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, email } = req.body; // Extraer email aunque no se permita modificar

  // Validar que el usuario esté actualizando su propio perfil
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para actualizar este perfil",
      code: "FORBIDDEN"
    });
  }

  // Rechazar modificaciones al correo electrónico
  if (email) {
    return res.status(400).json({
      success: false,
      message: "No se permite modificar el correo electrónico",
      code: "EMAIL_MODIFICATION_NOT_ALLOWED"
    });
  }

  // Validar campos obligatorios
  if (!nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: "Nombre y apellido son obligatorios",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  try {
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Persona, as: 'personas' }]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Preparar datos de actualización
    const updateData = {
      nombre,
      apellido,
      telefono: telefono || usuario.personas.telefono
    };

    // Manejar la imagen si se subió (código existente)
    // ...

    // Actualizar datos de persona asociada
    await usuario.personas.update(updateData);

    res.json({
      success: true,
      message: "Información actualizada correctamente",
      data: {
        nombre,
        apellido,
        telefono: updateData.telefono,
        foto_perfil: updateData.foto_perfil || usuario.personas.foto_perfil
      }
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};

const cambiarContrasena = async (req, res) => {
  const { id } = req.params;
  const { contrasenaActual, nuevaContrasena, confirmacionContrasena } = req.body;

  // Verificar que el usuario solo pueda cambiar su propia contraseña
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para cambiar esta contraseña",
      code: "FORBIDDEN"
    });
  }

  // Validar campos obligatorios
  if (!contrasenaActual || !nuevaContrasena || !confirmacionContrasena) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  // Validar que las nuevas contraseñas coincidan
  if (nuevaContrasena !== confirmacionContrasena) {
    return res.status(400).json({
      success: false,
      message: "Las contraseñas no coinciden",
      code: "PASSWORD_MISMATCH"
    });
  }

  // Validar criterios de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(nuevaContrasena)) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
      code: "INVALID_PASSWORD_FORMAT"
    });
  }

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Verificar contraseña actual
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.password);
    if (!contrasenaValida) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
        code: "INVALID_CURRENT_PASSWORD"
      });
    }

    // Hashear y guardar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar la contraseña",
      code: "PASSWORD_CHANGE_ERROR"
    });
  }
};

const crearAdmin = async (req, res) => {
  const { email, password, nombre, apellido, telefono } = req.body;

  // Validar campos obligatorios
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son obligatorios",
      code: "MISSING_REQUIRED_FIELDS",
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Formato de email inválido",
      code: "INVALID_EMAIL_FORMAT",
    });
  }

  // Validar criterios de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
      code: "INVALID_PASSWORD_FORMAT",
    });
  }

  // Validar que el email no esté ya registrado
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    return res.status(400).json({
      success: false,
      message: "El email ya está registrado",
      code: "EMAIL_ALREADY_REGISTERED",
    });
  }

  const t = await sequelize.transaction(); // Iniciar transacción
  try {
    // Crear nuevo usuario administrador
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear la entidad Persona
    const persona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t }
    );

    // Validar que la creación de Persona fue exitosa
    if (!persona) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al crear persona",
        code: "PERSON_CREATION_ERROR",
      });
    }

    // Crear la entidad Usuario
    const nuevoUsuario = await Usuario.create(
      {
        email,
        password: hashedPassword,
        rol_id: 1, // Rol de administrador
        persona_id: persona.id, // Relación con la persona creada
      },
      { transaction: t }
    );

    // Validar que la creación de Usuario fue exitosa
    if (!nuevoUsuario) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al crear usuario",
        code: "USER_CREATION_ERROR",
      });
    }

    await t.commit(); // Confirmar transacción

    res.status(201).json({
      success: true,
      message: "Administrador creado correctamente",
      data: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    await t.rollback(); // Revertir transacción en caso de error
    console.error("Error al crear administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
};

module.exports = {
  obtenerUsuarioActual,
  actualizarUsuario,
  cambiarContrasena,
  crearAdmin
};