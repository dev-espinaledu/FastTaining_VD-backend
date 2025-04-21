const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");
const { singleUpload, handleUploadErrors } = require("../middlewares/uploadMiddleware");

// Obtener usuario por ID
router.get("/usuarios/:id", authMiddleware, usuarioController.obtenerUsuarioPorId);
router.post("/usuarios/crear", usuarioController.CrearUsuario);

// Obtener información del usuario actual
router.get('/usuario/actual', authMiddleware, usuarioController.obtenerUsuarioActual);

// Ruta para actualizar datos del perfil
router.put(
  '/usuario/perfil',
  authMiddleware,
  validateProfileData,
  usuarioController.actualizarUsuario
);

// Ruta para actualizar solo la imagen
router.put(
  '/usuario/perfil/imagen',
  authMiddleware,
  singleUpload,
  validateImage,
  handleUploadErrors,
  usuarioController.actualizarImagenPerfil
);

// Cambiar contraseña
router.put(
    "/usuarios/:id/password",
    authMiddleware,
    usuarioController.cambiarContrasena
);

module.exports = router;