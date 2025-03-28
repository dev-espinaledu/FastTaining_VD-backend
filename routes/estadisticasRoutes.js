const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/estadisticas/jugador/:id', authMiddleware, estadisticasController.obtenerEstadisticas);
router.post('/estadisticas/generar', authMiddleware, estadisticasController.generarEstadisticas);

module.exports = router;
