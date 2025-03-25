const express = require("express");
const router = express.Router();
const {generarEntrenamiento} = require('../controllers/sesionentrenamientoController')

router.post("/entrenamiento/crear/:id", generarEntrenamiento);
//router.post("/crea", entrenamientoController.);

module.exports = router;