const { Usuario } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, "secreto_super_seguro", {
      expiresIn: "1h",
    });

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

module.exports = { login };
