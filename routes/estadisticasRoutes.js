const express = require("express");
const router = express.Router();
const estadisticasController = require("../controllers/estadisticasController");
const {
  authMiddleware,
  verificarEntrenador,
} = require("../middlewares/authMiddleware");

router.get(
  "/estadisticas/jugador/:id",
  authMiddleware,
  estadisticasController.obtenerEstadisticasJugador,
);
router.post(
  "/estadisticas/jugador/:jugador_id",
  // authMiddleware,
  estadisticasController.agregarDatosEstadisticasJugador,
);

// Ruta para obtener estadísticas del equipo (solo entrenadores pueden acceder)
router.get(
  "/estadisticas/equipo/:id",
  authMiddleware,
  verificarEntrenador,
  estadisticasController.obtenerEstadisticasEquipo,
);

module.exports = router;
