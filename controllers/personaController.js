const { Persona } = require("../models");

const obtenerPersonas = async (req, res) => {
  const personas = await Persona.findAll();
  res.json(personas);
};

const obtenerPersonaPorId = async (req, res) => {
  const { id } = req.params;
  const persona = await Persona.findByPk(id);
  res.json(persona);
};

module.exports = {
  obtenerPersonas,
  obtenerPersonaPorId
};
