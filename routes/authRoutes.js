const express = require("express");
const { login } = require("../controllers/authController");
const { authMiddleware, verificarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/ruta-protegida", authMiddleware, verificarAdmin, (req, res) => {
    res.json({ message: "Acceso permitido solo para administradores" });
});

module.exports = router;
