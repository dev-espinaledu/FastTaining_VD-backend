const express = require("express");
const router = express.Router();
const rolController = require("../controllers/rolController");

router.get("/roles/ver", rolController.verRoles);
router.post("/roles/crear", rolController.crearRol);
router.get("/roles/:id", rolController.verRol);
router.put("/roles/:id", rolController.actualizarRol);
router.delete("/roles/:id", rolController.eliminarRol);

module.exports = router;
