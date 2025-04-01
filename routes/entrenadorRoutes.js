const express = require("express");
const router = express.Router();
const entrenadorController = require("../controllers/entrenadorController");
const {
  authMiddleware,
  verificarAdmin,
  verificarEntrenador,
  verificarUsuarioOAdmin
} = require("../middlewares/authMiddleware");
const { validateProfileData, validateImage } = require("../middlewares/validationMiddleware");

// 🔹 Perfil del entrenador actual (requiere autenticación y rol entrenador)
router.get("/entrenador/perfil", 
  authMiddleware, 
  verificarEntrenador, 
  entrenadorController.verPerfil
);

router.put("/entrenador/perfil", 
  authMiddleware, 
  verificarEntrenador,
  validateProfileData,
  validateImage,
  entrenadorController.actualizarPerfil
);

// 🔹 Operaciones CRUD para administradores (sobre otros entrenadores)
router.post("/entrenador/crear", 
  authMiddleware, 
  verificarAdmin, 
  entrenadorController.crearEntrenador
);

router.get("/entrenador/:id", 
  authMiddleware, 
  verificarUsuarioOAdmin,
  entrenadorController.verEntrenador
);

router.put("/entrenador/:id", 
  authMiddleware, 
  verificarUsuarioOAdmin,
  entrenadorController.actualizarEntrenador
);

// 🔹 Listado público (sin autenticación)
router.get("/entrenadores/ver", entrenadorController.verEntrenadores);

module.exports = router;