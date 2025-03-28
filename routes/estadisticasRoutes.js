const express = require('express');
const { obtenerEstadisticas } = require('../controllers/estadisticasController');
const { verificarEntrenador } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta para obtener estadísticas del equipo (solo entrenadores pueden acceder)
router.get('/equipo/:id', verificarEntrenador, obtenerEstadisticas);

module.exports = router;
