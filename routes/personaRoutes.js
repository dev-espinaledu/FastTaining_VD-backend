// routes/personaRoutes.js
const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController'); // Asegúrate que la ruta es correcta
const upload = require('../middlewares/upload');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rutas
router.get('/', authMiddleware, personaController.obtenerPersonas);
router.get('/:id', authMiddleware, personaController.obtenerPersonaPorId);
// En tus rutas
router.put(
    '/:id',
    authMiddleware,
    upload.single('foto_perfil'), // Middleware de Multer
    personaController.actualizarPersona
    );

module.exports = router;