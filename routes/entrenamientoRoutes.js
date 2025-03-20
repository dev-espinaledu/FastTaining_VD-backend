const express = require("express");
const router = express.Router();
const entrenamientoController = require("../controllers/sesionEntrenamientoController");

router.post("/entrenamiento/crear", entrenamientoController.crearEntrenamiento);

module.exports = router;