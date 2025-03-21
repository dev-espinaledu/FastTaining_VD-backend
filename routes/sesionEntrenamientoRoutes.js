const express = require("express");
const router = express.Router();
const { getSesionById, updateSesion } = require("../controllers/sesionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:id", authMiddleware, getSesionById);
router.put("/:id", authMiddleware, updateSesion);

module.exports = router;
