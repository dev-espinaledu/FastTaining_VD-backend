const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

// Perfil del administrador
router.get(
  "/admin/perfil/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.verPerfil,
);

router.get(
  "/admin/verificar-perfil/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.verificarPerfilCompleto,
);

// Obtener admin por ID de usuario
router.get(
  "/admin/usuario/:id",
  authMiddleware,
  adminController.obtenerIdAdministradorConUsuario,
);

// Operaciones CRUD para administradores
router.post(
  "/admin/crear",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.crearAdministrador,
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.verAdministrador,
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.actualizarAdministrador,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.eliminarAdministrador,
);

module.exports = router;
