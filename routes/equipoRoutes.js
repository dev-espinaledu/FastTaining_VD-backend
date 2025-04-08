const express = require('express');
const { createTeam, getTeams } = require('../controllers/equipoController');
const upload = require('../middlewares/upload'); // Middleware para manejar imágenes
 

const router = express.Router();
 

router.post('/equipos', upload.single('file'), createTeam);
console.log("Ruta cargada correctamente ✅");

router.get('/crearequipos', getTeams);

module.exports = router;
