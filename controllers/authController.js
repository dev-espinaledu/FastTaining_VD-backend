const { Usuario, Token } = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { enviarCorreoRecuperacion } = require("../utils/emailService");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Obtener el rol y el correo del usuario
    const role = usuario.role || usuario.rol_id;
    const correo = usuario.email;  // Usar el correo del usuario

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, role },
      process.env.JWT_SECRET || "secreto_super_seguro",
      { expiresIn: "1h" }
    );

    res.json({ token, role, email }); // Ahora se incluye el correo del usuario en lugar del nombre

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

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

    // Crear un registro de token con usuario_id
    await Token.create({
      usuario_id: usuario.id,  // Asignar el id del usuario
      reset_token: token,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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

    // Validar la nueva contraseña :v
    if (nuevaContrasena.length < 8) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres." });
    }

    // Buscar el token en la base de datos
    const tokenRecord = await Token.findOne({ where: { reset_token: token } });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Token inválido o no encontrado." });
    }

    // Verificar si el token ha expirado
    if (new Date() > tokenRecord.reset_expiration) {
      return res.status(400).json({ message: "Token expirado." });
    }

    // Buscar al usuario asociado al token
    const usuario = await Usuario.findByPk(tokenRecord.usuario_id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.password = hashedPassword;

    // Eliminar el token utilizado
    await Token.destroy({ where: { reset_token: token } });

    await usuario.save();

    return res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};