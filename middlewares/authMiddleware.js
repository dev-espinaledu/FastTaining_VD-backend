import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado, token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, "secreto_super_seguro");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};
