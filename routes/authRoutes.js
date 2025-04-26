const express = require("express");
const { 
    login, 
    solicitarRecuperacion, 
    restablecerContrasena,
    cambiarContrasena // Asegúrate de agregar esta importación
} = require("../controllers/authController");
const { authMiddleware, verificarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/solicitar-recuperacion", solicitarRecuperacion);
router.put('/cambiar-contrasena', authMiddleware, cambiarContrasena);
router.post("/restablecer-contrasena", restablecerContrasena);
router.post("/ruta-protegida", authMiddleware, verificarAdmin, (req, res) => {
    res.json({ message: "Acceso permitido solo para administradores" });
});

module.exports = router;