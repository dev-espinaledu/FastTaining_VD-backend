const express = require('express');
const router = express.Router();
const {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  registrarToken
} = require('../controllers/notificacionesController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rutas para notificaciones
router.get('/notificaciones', authMiddleware, obtenerNotificaciones);
router.patch('/:id/leido', authMiddleware, marcarComoLeida);
router.patch('/marcar-todas-leidas', authMiddleware, marcarTodasComoLeidas);
router.post('/registrar-token', authMiddleware, registrarToken);

module.exports = router;