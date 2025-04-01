const express = require("express");
const router = express.Router();
const {
  generarEntrenamiento,
  verEntrenamientoIndividual,
  verEntrenamientos,
} = require("../controllers/sesionEntrenamientoController");

router.post("/entrenamiento/crear/:id", generarEntrenamiento);
router.get("/entrenamiento/ver/:id", verEntrenamientoIndividual);
router.get("/entrenamiento/", verEntrenamientos);

module.exports = router;
