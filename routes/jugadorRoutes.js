const express = require("express");
const router = express.Router();
const jugadorController = require("../controllers/jugadorController");

router.get("/jugadores", jugadorController.verJugadores);
router.post("/jugadores", jugadorController.crearJugador);
router.get("/jugadores/:id", jugadorController.verJugador);
router.put("/jugadores/:id", jugadorController.actualizarJugador);
router.delete("/jugadores/:id", jugadorController.eliminarJugador);

module.exports = router;