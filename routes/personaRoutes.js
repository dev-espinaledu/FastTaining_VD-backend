const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

// Obtener todas las personas
router.get('/personas', personaController.obtenerPersonas);

// Obtener una persona por ID
router.get('/personas/:id', personaController.obtenerPersonaPorId);

module.exports = router;