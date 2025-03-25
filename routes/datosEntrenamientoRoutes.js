const express = require("express");
const router = express.Router();
const {TomarDatosEntrenamiento} = require('../controllers/datosSesionController')

router.post("/sesion/crear", TomarDatosEntrenamiento);
//router.post("/crea", entrenamientoController.);

module.exports = router;