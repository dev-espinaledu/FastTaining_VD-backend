const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");
const { singleUpload, handleUploadErrors } = require("../middlewares/uploadMiddleware");

// Obtener información del usuario actual
router.get('/usuario/actual', authMiddleware, usuarioController.obtenerUsuarioActual);

// Actualizar información del usuario
router.put(
  "/usuario/perfil",
  authMiddleware,
  singleUpload,
  validateProfileData,
  validateImage,
  handleUploadErrors,
  usuarioController.actualizarUsuario
);

// Cambiar contraseña
router.put(
  "/usuarios/:id/password",
  authMiddleware,
  usuarioController.cambiarContrasena
);

module.exports = router;