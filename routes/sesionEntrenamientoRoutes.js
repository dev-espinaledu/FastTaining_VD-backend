const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware"); // Middleware de autenticación
const { getSesionById, getSesionesByEntrenador } = require("../controllers/sesionEntrenamientoController");

// Ruta para obtener una sesión específica (validando permisos)
router.get("/:id", auth, getSesionById);

// Ruta para obtener sesiones asignadas a un entrenador
router.get("/entrenador/:id", auth, getSesionesByEntrenador);

module.exports = router;

