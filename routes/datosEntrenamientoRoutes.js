const express = require("express");
const router = express.Router();
const {RegistrarDatosPosición} = require('../controllers/datosSesionController')

router.post("/sesion/crear/:id", RegistrarDatosPosición);
//router.post("/crea", entrenamientoController.);

module.exports = router;