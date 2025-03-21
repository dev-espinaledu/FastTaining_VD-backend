const { Usuario } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

let intentosFallidos = {}; // Rastreo de intentos fallidos

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de email y contraseña
    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Correo inválido" });
    }

    // Verificar si el usuario ha excedido intentos fallidos
    if (intentosFallidos[email] && intentosFallidos[email].intentos >= 5) {
      const tiempoBloqueo = (Date.now() - intentosFallidos[email].primerIntento) / 1000 / 60;
      if (tiempoBloqueo < 15) {
        return res.status(403).json({ message: "Demasiados intentos fallidos. Intenta más tarde." });
      } else {
        delete intentosFallidos[email]; // Restablecer intentos fallidos
      }
    }

    const user = await Usuario.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      // Registrar intento fallido
      if (!intentosFallidos[email]) {
        intentosFallidos[email] = { intentos: 1, primerIntento: Date.now() };
      } else {
        intentosFallidos[email].intentos++;
      }
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Restablecer intentos fallidos tras un inicio de sesión exitoso
    delete intentosFallidos[email];

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, role: user.rol_id });
  } catch (error) {
    console.error("Error en /auth/login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { login };