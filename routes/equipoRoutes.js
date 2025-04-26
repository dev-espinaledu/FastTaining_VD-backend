const express = require('express');
const multer = require("multer");
const { createTeam, getTeams, obtenerEquipoPorId } = require('../controllers/equipoController');
const upload = require('../middlewares/upload'); // Middleware para manejar imágenes
 

const router = express.Router();
 

router.post('/equipos', upload.single('escudo'), createTeam);
console.log("✅ Ruta /api/equipos cargada correctamente");

router.get('/equipos', getTeams);
router.get('/equipos/:id', obtenerEquipoPorId); // Cambia esto por la función correcta para obtener un equipo por ID 

module.exports = router;
