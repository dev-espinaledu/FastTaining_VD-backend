const express = require("express");
const router = express.Router();
const entrenadorController = require("../controllers/entrenadorController");

router.get("/entrenador/ver", entrenadorController.verEntrenadores);
router.post("/entrenador/crear", entrenadorController.crearEntrenador);
router.put("/entrenador/:id", entrenadorController.actualizarEntrenador);
router.get("/entrenador/:id", entrenadorController.verEntrenador);

module.exports = router;

// http://localhost:5000/api/entrenador/ver <- Ruta para mostrar datos de entrenador
// http://localhost:5000/api/entrenador/crear <- Ruta para crear un entrenador
// http://localhost:5000/api/entrenador/1 <- Ruta para actualizar datos de entrenador
// http://localhost:5000/api/entrenador/1 <- Ruta para mostrar datos de  un entrenador