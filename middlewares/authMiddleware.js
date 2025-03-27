const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const verificarAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "administrador") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

const verificarEntrenador = (req, res, next) => {
  if (!req.user || req.user.role !== "entrenador") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de entrenador." });
  }
  next();
};

module.exports = { authMiddleware, verificarAdmin, verificarEntrenador };