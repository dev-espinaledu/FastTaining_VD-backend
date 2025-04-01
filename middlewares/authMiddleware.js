const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

// Mapeo de roles (ID → Nombre)
const roleMap = {
  1: "admin",
  2: "entrenador",
  3: "jugador"
};

// Middleware principal de autenticación
const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtener token de múltiples fuentes
    let token;
    
    // a) De headers Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // b) De cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Verificar existencia del token
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Acceso denegado. Token no proporcionado.",
        code: "MISSING_TOKEN"
      });
    }

    // 3. Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
    
    // 4. Asignar datos del usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role, // ID numérico
      roleName: roleMap[decoded.role] || decoded.role, // Nombre legible
      email: decoded.email // Si está disponible en el token
    };
    
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
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Middleware para verificación de roles (genérico)
const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autenticación requerida",
        code: "AUTH_REQUIRED"
      });
    }

    // Convertir requiredRoles a array si es necesario
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Verificar acceso (tanto por ID como por nombre)
    const hasAccess = rolesArray.some(requiredRole => {
      return (
        req.user.role === requiredRole || 
        req.user.roleName === requiredRole ||
        roleMap[req.user.role] === requiredRole
      );
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requieren permisos de: ${rolesArray.join(", ")}`,
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: rolesArray,
        userRole: req.user.roleName || roleMap[req.user.role] || req.user.role
      });
    }

    next();
  };
};

// Middlewares específicos (derivados del genérico)
const verificarAdmin = roleMiddleware(["admin", 1]);
const verificarEntrenador = roleMiddleware(["entrenador", 2]);
const verificarJugador = roleMiddleware(["jugador", 3]);

// Middleware para verificar propiedad o admin
const verificarUsuarioOAdmin = (req, res, next) => {
  const requestedUserId = req.params.id || req.body.userId;
  
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: "Autenticación requerida",
      code: "AUTH_REQUIRED"
    });
  }

  if (req.user.id == requestedUserId || req.user.role === 1 || req.user.roleName === "admin") {
    return next();
  }

  res.status(403).json({
    success: false,
    message: "Acceso denegado. Solo puedes realizar esta acción sobre tu propio usuario o siendo administrador",
    code: "OWNERSHIP_REQUIRED"
  });
};

// Configuración de cookie-parser
const cookieParserMiddleware = cookieParser(process.env.COOKIE_SECRET || "secreto_cookies", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000 // 1 día
});

module.exports = {
  authMiddleware,
  roleMiddleware,
  verificarAdmin,
  verificarEntrenador,
  verificarJugador,
  verificarUsuarioOAdmin,
  cookieParser: cookieParserMiddleware
};
