const { DatoSesion, Jugador, sequelize } = require("../models");

const TomarDatosEntrenamiento = async (req, res) => {
  try {
    const { fecha, objetivo, jugador_id } = req.body;
    const nuevaSesion = await DatoSesion.create({
      fecha,
      objetivo,
      jugador_id
    });

    res.json({ datos_sesion: nuevaSesion });
  } catch (e) {
    console.log(`Error desde RegistrarDatosSesión ${e}`)
    res.status(500).json({ error: e });
  }
};

const RegistrarDatosPosición = async (req, res) => {
  const {id} = req.params;  
  const { fecha, objetivo, posicion } = req.body;  

  try {
    console.log(id)
    console.log(posicion)
    const promedio = await Jugador.findOne({
      where:[
        {equipo_id: id},
        {posicion: posicion},
      ],
      attributes:[
        [sequelize.fn("AVG", sequelize.col("altura")), "promedioAltura"],
        [sequelize.fn("AVG", sequelize.col("peso")), "promedioPeso"],
        [sequelize.fn("AVG", sequelize.col("porcentaje_grasa_corporal")), "promedioGrasaCorp"],
        [sequelize.fn("AVG", sequelize.col("porcentaje_masa_muscular")), "promedioMasaMus"], 
        [sequelize.fn("AVG", sequelize.col("potencia_muscular_pierna")), "promedioPotencia"],
        [sequelize.fn("AVG", sequelize.col("velocidad_max")), "promedioVelocidad"],
        [sequelize.fn("AVG", sequelize.col("resistencia_aerobica")), "promedioResAerobica"],
        [sequelize.fn("AVG", sequelize.col("resistencia_anaerobica")), "promedioResAnaerobica"],
        [sequelize.fn("AVG", sequelize.col("flexibilidad")), "promedioFlexibilidad"],
      ],
      raw: true
    });
    console.log(promedio.promedioPeso, promedio.promedioGrasaCorp, promedio.promedioMasaMus)
    if (!promedio) {
      return res.status(404).json({ error: "No se encontraron jugadores con esos criterios." });
    }

    if (promedio) {
      const newData = await DatoSesion.create({
        equipo_id: id,
        fecha,
        objetivo,
        posicion,
        altura: promedio.promedioAltura,
        peso: promedio.promedioPeso,
        porcentaje_grasa_corporal: promedio.promedioGrasaCorp,
        porcentaje_masa_muscular: promedio.promedioMasaMus, 
        potencia_muscular_pierna: promedio.promedioPotencia,
        velocidad: promedio.promedioVelocidad,
        resistencia_aerobica: promedio.promedioResAerobica,
        resistencia_anaerobica: promedio.promedioResAnaerobica,
        flexibilidad: promedio.promedioFlexibilidad,
      });

     
      res.status(201).json(newData);  
    } else {
      res.status(404).json({ error: "No se encontraron datos para la posición y equipo especificados." });
    }

  } catch (e) {
    console.log(`Error en RegistrarDatosPosición: ${e}`);
    res.status(500).json({ error: e.message });
  }
};

module.exports = { RegistrarDatosPosición };