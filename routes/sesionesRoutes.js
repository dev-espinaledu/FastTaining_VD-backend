const express = require("express");
const router = express.Router();
const sesionEntrenamientoController = require("../controllers/sesionEntrenamientoController");

router.post("/crear/:id", sesionEntrenamientoController.generarEntrenamiento);
router.get("/sesiones", sesionEntrenamientoController.obtenerSesiones);
//router.post("/crea", entrenamientoController.);

module.exports = router;
