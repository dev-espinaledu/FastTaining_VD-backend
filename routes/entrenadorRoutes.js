const express = require("express");
const router = express.Router();
const entrenadorController = require("../controllers/entrenadorController");
const { authMiddleware, verificarEntrenador } = require("../middlewares/authMiddleware");

// Obtener todos los entrenadores (protegido, solo usuarios autenticados)
router.get("/entrenador/ver", authMiddleware, entrenadorController.verEntrenadores);

// Crear un nuevo entrenador (protegido, solo entrenadores pueden hacerlo)
router.post("/entrenador/crear", authMiddleware, verificarEntrenador, entrenadorController.crearEntrenador);

// Obtener un entrenador específico por ID (protegido, solo usuarios autenticados)
router.get("/entrenador/:id", authMiddleware, entrenadorController.verEntrenador);

module.exports = router;
