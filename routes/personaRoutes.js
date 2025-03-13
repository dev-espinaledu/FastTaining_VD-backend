const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");

router.get("/personas", personaController.verPersonas);
router.post("/personas", personaController.crearPersona);
router.get("/personas/:id", personaController.verPersona);
router.put("/personas/:id", personaController.actualizarPersona);
router.delete("/personas/:id", personaController.eliminarPersona);

module.exports = router;