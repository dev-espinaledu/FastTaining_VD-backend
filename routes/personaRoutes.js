const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");

// router.get("/personas", personaController.verPersonas);
// router.post("/personas/crear", personaController.crearPersona);
router.get("/personas/:id", personaController.obtenerPersonaPorId);
// router.put("/personas/:id", personaController.actualizarPersona);
// router.delete("/personas/:id", personaController.eliminarPersona);

module.exports = router;