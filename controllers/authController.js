const { Usuario } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

let intentosFallidos = {}; // Objeto para rastrear intentos fallidos

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    // Bloqueo si hay más de 5 intentos en 15 minutos
    if (intentosFallidos[email] && intentosFallidos[email].intentos >= 5) {
      const tiempoBloqueo = (Date.now() - intentosFallidos[email].primerIntento) / 1000 / 60;
      if (tiempoBloqueo < 15) {
        return res.status(403).json({ message: "Demasiados intentos fallidos. Intenta más tarde." });
      } else {
        delete intentosFallidos[email]; // Restablecer intentos
      }
    }

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      // Registrar intento fallido
      if (!intentosFallidos[email]) {
        intentosFallidos[email] = { intentos: 1, primerIntento: Date.now() };
      } else {
        intentosFallidos[email].intentos++;
      }
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si el login es exitoso, restablecer intentos fallidos
    delete intentosFallidos[email];

    // Generar token con información del usuario
    const token = jwt.sign(
      { userId: user.id, role: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, role: user.rol_id });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { login };