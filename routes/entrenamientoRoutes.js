const express = require("express");
const router = express.Router();
const {
  generarEntrenamientoIndividual,
  verEntrenamiento,
  obtenerSesiones,
} = require("../controllers/sesionEntrenamientoController");

router.post("/entrenamiento/crear/:id", generarEntrenamientoIndividual);
router.get("/entrenamiento/ver/:id", verEntrenamiento);
router.get("/entrenamiento/obtener", obtenerSesiones);
module.exports = router;
