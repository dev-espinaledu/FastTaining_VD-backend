const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateProfileData, validateImage } = require('../middlewares/validationMiddleware');
const { singleUpload, handleUploadErrors } = require('../middlewares/uploadMiddleware');

// Rutas protegidas con autenticación y validaciones
router.get('/', authMiddleware, personaController.obtenerPersonas);
router.get('/:id', authMiddleware, personaController.obtenerPersonaPorId);

module.exports = router;