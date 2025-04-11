const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/upload");

// Obtener usuario por ID
router.get("/usuarios/:id", authMiddleware, usuarioController.obtenerUsuarioPorId);

// Actualizar información del usuario
router.put(
    "/usuarios/:id",
    authMiddleware,
    upload.single("foto_perfil"),
    validateProfileData,
    validateImage,
    usuarioController.actualizarUsuario
);

// Cambiar contraseña
router.put(
    "/usuarios/:id/password",
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