const express = require("express");
const router = express.Router();
const jugadorController = require("../controllers/jugadorController");

router.get("/jugadores/ver", jugadorController.verJugadores);
router.post("/jugadores/crear", jugadorController.crearJugador);
router.get("/jugadores/:id", jugadorController.verJugador);
router.put("/jugadores-info/:id", jugadorController.actualizarJugador);
router.put("/jugadores/:id", jugadorController.actualizarCapacidadJugador);
router.delete("/jugadores/:id", jugadorController.eliminarJugador);

module.exports = router;
