const express = require("express");
const router = express.Router();
const estadisticasController = require("../controllers/estadisticasController");
const sesionEntrenamientoController = require("../controllers/sesionEntrenamientoController");
const jugadorController = require("../controllers/jugadorController");
const {
  authMiddleware,
  roleMiddleware,
  verificarUsuarioOAdmin,
} = require("../middlewares/authMiddleware");
const {
  validateProfileData,
  validateImage,
} = require("../middlewares/validationMiddleware");

// 🔹 Public routes (no authentication required)
router.get("/jugadores/ver", jugadorController.verJugadores);

// 🔹 Player profile routes (requires player authentication)
router.get(
  "/jugador/perfil",
  authMiddleware,
  roleMiddleware("jugador"),
  jugadorController.verPerfil,
);

router.get(
  "/jugador/verificar-perfil",
  authMiddleware,
  roleMiddleware("jugador"),
  jugadorController.verificarPerfilCompleto,
);

router.put(
  "/jugador/perfil",
  authMiddleware,
  roleMiddleware("jugador"),
  validateProfileData,
  jugadorController.actualizarPerfil,
);

// 🔹 Player statistics and training sessions
router.get(
  "/jugador/estadisticas/:id",
  authMiddleware,
  estadisticasController.obtenerEstadisticasJugador,
);

router.get(
  "/jugador/entrenamientos/:id",
  authMiddleware,
  sesionEntrenamientoController.obtenerEntrenamientosPorJugador,
);

// Obtiene el jugador por su ID de usuario, se usa en JugadorDataContext del frontend para saber el jugador actual
router.get(
  "/jugador/usuario/:id",
  authMiddleware,
  jugadorController.obtenerJugadorPorUsuario,
);

// 🔹 CRUD operations for admins/coaches
router.post(
  "/jugador/crear",
  authMiddleware,
  roleMiddleware(["admin", "entrenador"]),
  jugadorController.crearJugador,
);

router.get(
  "/jugador/:id",
  authMiddleware,
  roleMiddleware(["admin", "entrenador", "jugador"]),
  jugadorController.verJugador,
);

router.put(
  "/jugador-info/:id", // Full update (admin or player owner)
  authMiddleware,
  verificarUsuarioOAdmin,
  jugadorController.actualizarJugador,
);

router.put(
  "/jugador/:id", // Physical capabilities only (admin/coach)
  authMiddleware,
  roleMiddleware(["admin", "entrenador"]),
  jugadorController.actualizarCapacidadJugador,
);

router.delete(
  "/jugador/:id",
  authMiddleware,
  roleMiddleware("admin"),
  jugadorController.eliminarJugador,
);

module.exports = router;
