const express = require("express");
const router = express.Router();
const {
  generarEntrenamiento,
} = require("../controllers/sesionEntrenamientoController");

router.post("/crear/:id", generarEntrenamiento);
//router.post("/crea", entrenamientoController.);

module.exports = router;
