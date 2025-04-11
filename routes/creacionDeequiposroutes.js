const express = require('express');
const router = express.Router();
const {
  crearEquipo,
  editarEquipo,
  jugadoresDisponibles,
  entrenadoresDisponibles
} = require('../controllers/creacionDeequipos');




router.post('/', crearEquipo);
router.put('/',  editarEquipo);
router.get('/', jugadoresDisponibles);
router.get('/', entrenadoresDisponibles);

module.exports = router;
