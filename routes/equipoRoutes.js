const express = require('express');
const multer = require("multer");
const { createTeam, getTeams } = require('../controllers/equipoController');
const upload = require('../middlewares/upload'); // Middleware para manejar imágenes
 

const router = express.Router();
 

router.post('/equipos', upload.single('escudo'), createTeam);
console.log("✅ Ruta /api/equipos cargada correctamente");

router.get('/equipos', getTeams);

module.exports = router;
