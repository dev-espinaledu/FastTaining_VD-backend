const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");
const { singleUpload, handleUploadErrors } = require("../middlewares/uploadMiddleware");

// Obtener usuario por ID
router.get("/usuarios/:id", authMiddleware, usuarioController.obtenerUsuarioPorId);
router.post("/usuarios/crear", usuarioController.CrearUsuario);

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