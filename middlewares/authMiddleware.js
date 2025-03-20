import jwt from "jsonwebtoken";
const { Usuario } = require("../models"); // Importamos el modelo de usuario

// export const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Acceso denegado, token no proporcionado" });
//   }

//   try {
//     const decoded = jwt.verify(token, "secreto_super_seguro");
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Token inválido" });
//   }
// };

export const SesionEntrenamiento = (req, res, next)=> {
module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization"); 

    if (!token) {
      return res.status(401).json({ msg: "Acceso denegado, token requerido" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, " secreto_super_seguro ");
    req.user = decoded; 

    
    const userExists = await Usuario.findByPk(req.user.id);
    if (!userExists) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }

    next(); 
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};
};