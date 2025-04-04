const { Usuario } = require("../models");

const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  const usuario = await Usuario.findByPk(id);
  res.json(usuario);
};

module.exports = {
  obtenerUsuarioPorId
};
