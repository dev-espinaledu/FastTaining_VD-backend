const express = require("express");
const router = express.Router();
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

// 🔹 Perfil del jugador actual (requiere autenticación y rol jugador)
router.get(
  "/jugador/perfil",
  authMiddleware,
  roleMiddleware("jugador"),
  jugadorController.verPerfil,
);

router.put(
  "/jugador/perfil",
  authMiddleware,
  roleMiddleware("jugador"),
  validateProfileData,
  validateImage,
  jugadorController.actualizarPerfil,
);

// 🔹 Operaciones CRUD para administradores/entrenadores
router.post("/jugador/crear", jugadorController.crearJugador);

router.get(
  "/jugador/:id",
  authMiddleware,
  roleMiddleware(["admin", "entrenador", "jugador"]),
  jugadorController.verJugador,
);

router.put(
  "/jugador-info/:id", // Actualización completa (admin/jugador dueño)
  authMiddleware,
  verificarUsuarioOAdmin,
  jugadorController.actualizarJugador,
);

router.put(
  "/jugador/:id", // Solo capacidades físicas (admin/entrenador)
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

// 🔹 Listado público (sin autenticación)
router.get("/jugadores/ver", jugadorController.verJugadores);

module.exports = router;
