const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/upload");

// Obtener información del usuario actual
router.get("/usuario", authMiddleware, usuarioController.obtenerUsuarioActual);

// Actualizar información del usuario
router.put(
  "/usuario",
  authMiddleware,
  upload.single("foto_perfil"),
  validateProfileData,
  validateImage,
  usuarioController.actualizarUsuario
);

// Cambiar contraseña
router.put(
  "/usuario/password",
  authMiddleware,
  usuarioController.cambiarContrasena
);

// Ruta para crear admins 😼
router.post(
    "/usuarios/admin",
    // authMiddleware,
    usuarioController.crearAdmin
);

module.exports = router;