const express = require("express");
const router = express.Router();
const {TomarDatosEntrenamiento} = require('../controllers/datosSesionController')

router.post("/entrenamiento/crear", TomarDatosEntrenamiento);
//router.post("/crea", entrenamientoController.);

module.exports = router;