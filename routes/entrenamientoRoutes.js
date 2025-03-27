const express = require("express");
const router = express.Router();
const {generarEntrenamientoIndividual, verEntrenamientoIndividual, verEntrenamiento} = require('../controllers/sesionEntrenamientoController')
router.post("/entrenamiento/crear/:id", generarEntrenamientoIndividual);
router.get("/entrenamiento/ver/:id", verEntrenamientoIndividual);
router.get("/entrenamiento/", verEntrenamiento);


module.exports = router;
