const express = require("express");
const router = express.Router();
const equipoController = require("../controllers/equipoController");

router.get("/equipo/ver", equipoController.verEquipos);
router.post("/equipo/crear", equipoController.crearEquipo);
router.get("/equipo/:id", equipoController.verEquipo);
// router.put("/equipo/:id", equipoController.actualizarJugador);
// router.delete("/equipo/:id", equipoController.eliminarJugador);

module.exports = router;
