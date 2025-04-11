const express = require('express');
const { agregarPromediosPorPosicion, agregarPromediosPorFechas, obtenerPromedioEstadisticas, obtenerEstadisticasPorTodasLasPosiciones } = require('../controllers/promedioController');
const router = express.Router();

router.post('/promedios/posicion', agregarPromediosPorPosicion);
router.post("/agregar-promedios", agregarPromediosPorFechas);
router.get("/estadisticas/posiciones", obtenerEstadisticasPorTodasLasPosiciones);


module.exports = router;