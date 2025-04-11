const { Usuario, Token, Persona } = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { enviarCorreoRecuperacion } = require("../utils/emailService");

// Mapeo de roles
const roleMap = {
  1: "admin",
  2: "entrenador",
  3: "jugador",
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario con su información de persona
    const usuario = await Usuario.findOne({
      where: { email },
      include: [
        {
          model: Persona,
          as: "personas",
          attributes: ["nombre", "apellido", "telefono"],
        },
      ],
      attributes: ["id", "email", "password", "rol_id"],
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.rol_id,
        roleName: roleMap[usuario.rol_id],
      },
      process.env.JWT_SECRET || "secreto_super_seguro",
      { expiresIn: "1h" },
    );

    // Respuesta estructurada
    res.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.rol_id,
        roleName: roleMap[usuario.rol_id],
        persona: usuario.personas,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // Eliminar tokens previos si existen
    await Token.destroy({ where: { usuario_id: usuario.id } });

    // Generar nuevo token (se usa createdAt para calcular la expiración)
    const token = crypto.randomBytes(32).toString("hex");

    await Token.create({
      usuario_id: usuario.id,
      reset_token: token,
    });

    // Enviar correo
    await enviarCorreoRecuperacion(email, token);

    res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
  } catch (error) {
    console.error("Error en solicitud de recuperación:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
};

exports.restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    // Validar formato de contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nuevaContrasena)) {
      return res.status(400).json({
        success: false,
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.",
        code: "INVALID_PASSWORD_FORMAT",
      });
    }

    // Buscar token
    const tokenRecord = await Token.findOne({
      where: {
        reset_token: token,
      },
    });

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Token inválido",
        code: "INVALID_TOKEN",
      });
    }

    // Calcular expiración
    const fechaExpiracion = new Date(tokenRecord.createdAt.getTime() + 3600000); // 1 hora :p
    if (fechaExpiracion < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Token expirado",
        code: "EXPIRED_TOKEN",
      });
    }

    // Actualizar contraseña
    const usuario = await Usuario.findByPk(tokenRecord.usuario_id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.update({ password: hashedPassword });

    // Eliminar el token usado
    await Token.destroy({ where: { reset_token: token } });

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
};
