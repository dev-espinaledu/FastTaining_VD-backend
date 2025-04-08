const { Persona } = require("../models");

const obtenerPersonas = async (req, res) => {
  try {
    const personas = await Persona.findAll();
    res.json(personas);
  } catch (error) {
    console.error("Error al obtener personas:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};

const obtenerPersonaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de persona no válido",
        code: "INVALID_ID"
      });
    }

    const persona = await Persona.findByPk(id);
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona no encontrada",
        code: "PERSONA_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error("Error al obtener persona por ID:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};

module.exports = {
  obtenerPersonas,
  obtenerPersonaPorId
};