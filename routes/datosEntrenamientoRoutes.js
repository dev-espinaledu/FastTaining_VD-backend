const express = require("express");
const router = express.Router();
const {RegistrarDatosPosicion} = require('../controllers/datosSesionController')

router.post("/sesion/crear/:equipoId", RegistrarDatosPosicion);
//router.post("/crea", entrenamientoController.);

module.exports = router;