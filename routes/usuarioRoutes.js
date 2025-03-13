const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

router.get("/usuarios/ver", usuarioController.verUsuarios);
router.post("/usuarios/crear", usuarioController.crearUsuario);
router.get("/usuarios/:id", usuarioController.verUsuario);
router.put("/usuarios/:id", usuarioController.actualizarUsuario);
router.delete("/usuarios/:id", usuarioController.eliminarUsuario);

module.exports = router;
