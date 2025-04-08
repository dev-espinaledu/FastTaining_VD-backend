const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Obtener usuario por ID
router.get("/usuarios/:id", usuarioController.obtenerUsuarioPorId);

module.exports = router
