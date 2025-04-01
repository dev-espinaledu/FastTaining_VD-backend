const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

// Middleware para verificar el JWT en el encabezado Authorization
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso denegado, token no proporcionado o mal formado" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;  // Aquí asignamos los datos del usuario decodificado
    next();
  } catch (error) {
    // Manejo detallado de errores
    let message = "Token inválido";
    let code = "INVALID_TOKEN";
    
    if (error.name === "TokenExpiredError") {
      message = "Token expirado";
      code = "TOKEN_EXPIRED";
    } else if (error.name === "JsonWebTokenError") {
      message = "Token malformado";
      code = "MALFORMED_TOKEN";
    }

    res.status(401).json({ 
      success: false,
      message,
      code,
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Middleware para verificar si el usuario tiene rol de administrador
const verificarAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "administrador") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// Middleware para verificar si el usuario tiene rol de entrenador
const verificarEntrenador = (req, res, next) => {
  if (!req.user || req.user.role !== "entrenador") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de entrenador." });
  }
  next();
};

// Usando cookie-parser correctamente (no es necesario crear tu propio middleware de cookies)
const cookieParserH = cookieParser();  // Usamos la implementación estándar de cookie-parser

module.exports = { authMiddleware, verificarAdmin, verificarEntrenador, cookieParserH };
