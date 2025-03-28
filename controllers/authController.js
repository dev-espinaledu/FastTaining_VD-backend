const { Usuario } = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { enviarCorreoRecuperacion } = require("../utils/emailService");

// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar token único y establecer expiración (1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la BD
    usuario.reset_token = token;
    usuario.reset_expiration = expiration;
    await usuario.save();

    // Enviar el correo con el enlace de recuperación
    await enviarCorreoRecuperacion(email, token);

    return res.json({ message: "Correo de recuperación enviado." });
  } catch (error) {
    console.error("Error en solicitud de recuperación:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// Restablecer la contraseña
exports.restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { reset_token: token } });

    if (!usuario || usuario.reset_expiration < new Date()) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar la contraseña y limpiar el token
    usuario.password = hashedPassword;
    usuario.reset_token = null;
    usuario.reset_expiration = null;
    await usuario.save();

    return res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};