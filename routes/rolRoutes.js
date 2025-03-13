const express = require("express");
const router = express.Router();
const rolController = require("../controllers/rolController");

router.get("/roles", rolController.verRoles);
router.post("/roles", rolController.crearRol);
router.get("/roles/:id", rolController.verRol);
router.put("/roles/:id", rolController.actualizarRol);
router.delete("/roles/:id", rolController.eliminarRol);

module.exports = router;