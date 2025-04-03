const express = require("express");
const router = express.Router();
const entrenadorController = require("../controllers/entrenadorController");
const {
  authMiddleware,
  verificarAdmin,
  verificarEntrenador,
  verificarUsuarioOAdmin,
} = require("../middlewares/authMiddleware");
const {
  validateProfileData,
  validateImage,
} = require("../middlewares/validationMiddleware");

// 🔹 Perfil del entrenador actual (requiere autenticación y rol entrenador)
router.get(
  "/entrenador/perfil",
  authMiddleware,
  verificarEntrenador,
  entrenadorController.verPerfil,
);

router.put(
  "/entrenador/perfil",
  authMiddleware,
  verificarEntrenador,
  validateProfileData,
  validateImage,
  entrenadorController.actualizarPerfil,
);
router.get("/entrenador/:id", entrenadorController.verEntrenador);

router.post("/entrenador/crear", entrenadorController.crearEntrenador);

module.exports = router;

// http://localhost:5000/api/entrenador/ver <- Ruta para mostrar datos de entrenador
// http://localhost:5000/api/entrenador/crear <- Ruta para crear un entrenador
// http://localhost:5000/api/entrenador/1 <- Ruta para actualizar datos de entrenador
// http://localhost:5000/api/entrenador/1 <- Ruta para mostrar datos de  un entrenador
