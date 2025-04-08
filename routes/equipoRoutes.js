const express = require('express');
const { createTeam, getTeams, updateTeam, deleteTeam } = require('../controllers/equipoController');
const upload = require('../middlewares/upload'); // Middleware para manejar imágenes
 

const router = express.Router();
 

router.post('/equipos', upload.single('file'), createTeam);
console.log("Ruta cargada correctamente ✅");

router.get('/mostrarequipos', getTeams);


// Actualizar equipo
router.put('/equipos/:id', upload.single('escudo'), updateTeam);

// Eliminar equipo
router.delete('/equipos/:id', deleteTeam);

module.exports = router;
