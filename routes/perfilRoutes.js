const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  singleUpload,
  handleUploadErrors,
} = require("../middlewares/uploadMiddleware");
const {
  validateProfileData,
  validateImage,
} = require("../middlewares/validationMiddleware");

// Ruta única para actualización de perfil
router.put(
  "/perfil/:id",
  authMiddleware,
  singleUpload,
  validateProfileData,
  validateImage,
  handleUploadErrors,
  perfilController.actualizarPerfilUniversal,
);

module.exports = router;
