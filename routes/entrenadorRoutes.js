const express = require("express");
const router = express.Router();
const entrenadorController = require("../controllers/entrenadorController");

router.get("/entrenador/ver", entrenadorController.verEntrenadores);
router.post("/entrenador/crear", entrenadorController.crearEntrenador);
router.get("/entrenador/:id", entrenadorController.verEntrenador);

module.exports = router;
