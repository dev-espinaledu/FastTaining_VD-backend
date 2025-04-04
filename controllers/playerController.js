const { estadisticas } = require('../models');

// Obtener todas las estadisticas
exports.getAllStats = async (req, res) => {
  try {
    const stats = await estadisticas.findAll();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las estadísticas" });
  }
};

// Obtener una estadistica por ID
exports.getStatById = async (req, res) => {
  try {
    const stat = await estadisticas.findByPk(req.params.id);
    if (!stat) return res.status(404).json({ error: "Estadística no encontrada" });
    res.status(200).json(stat);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la estadística" });
  }
};

// Crear una nueva estadistica
exports.createStat = async (req, res) => {
  try {
    const newStat = await estadisticas.create(req.body);
    res.status(201).json(newStat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la estadística" });
  }
};

// Actualizar una estadistica por ID
exports.updateStat = async (req, res) => {
  try {
    const stat = await estadisticas.findByPk(req.params.id);
    if (!stat) return res.status(404).json({ error: "Estadística no encontrada" });

    await stat.update(req.body);
    res.status(200).json(stat);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la estadística" });
  }
};

// Eliminar una estadistica por ID
exports.deleteStat = async (req, res) => {
  try {
    const stat = await estadisticas.findByPk(req.params.id);
    if (!stat) return res.status(404).json({ error: "Estadística no encontrada" });

    await stat.destroy();
    res.status(200).json({ message: "Estadística eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la estadística" });
  }
};
