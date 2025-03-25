const express = require("express");
const router = express.Router();
const {generarEntrenamientoIndividual, verEntrenamiento} = require('../controllers/sesionentrenamientoController')

router.post("/entrenamiento/crear/:id", generarEntrenamientoIndividual);
router.get("/entrenamiento/ver/:id", verEntrenamiento);

module.exports = router;