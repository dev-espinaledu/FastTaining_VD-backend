const { CreacionDeEquipo, Jugador, Entrenador } = require('../models');

// POST /creacion-de-equipos
const crearEquipo = async (req, res) => {
  const { nombre, categoria, imagen, jugadores = [], entrenador } = req.body;

  if (!nombre || !categoria) {
    return res.status(400).json({ message: 'Falta información: nombre o categoría' });
  }

  // Validar nombre único
  const existente = await CreacionDeEquipo.findOne({ where: { nombre } });
  if (existente) {
    return res.status(409).json({ message: 'Ya existe un equipo con este nombre, elige otro' });
  }

  // Validar que los jugadores y entrenador estén libres
  const jugadoresOcupados = await Jugador.findAll({ where: { equipoId: { [Op.ne]: null }, id: jugadores } });
  if (jugadoresOcupados.length > 0) {
    return res.status(400).json({ message: 'Algunos jugadores ya están asignados a un equipo' });
  }

  if (entrenador) {
    const entrenadorOcupado = await Entrenador.findOne({ where: { id: entrenador, equipoId: { [Op.ne]: null } } });
    if (entrenadorOcupado) {
      return res.status(400).json({ message: 'Este entrenador ya está asignado a un equipo' });
    }
  }

  // Crear equipo
  const nuevoEquipo = await CreacionDeEquipo.create({ nombre, categoria, imagen });

  // Asignar jugadores
  if (jugadores.length > 0) {
    await Jugador.update({ equipoId: nuevoEquipo.id }, { where: { id: jugadores } });
  }

  // Asignar entrenador
  if (entrenador) {
    await Entrenador.update({ equipoId: nuevoEquipo.id }, { where: { id: entrenador } });
  }

  return res.status(201).json({ message: 'Equipo creado correctamente', equipo: nuevoEquipo });
};

// PUT /creacion-de-equipos/:id
const editarEquipo = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, imagen, jugadores = [], entrenador } = req.body;

  const equipo = await CreacionDeEquipo.findByPk(id);
  if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });

  // Validar duplicidad si cambió el nombre
  if (nombre && nombre !== equipo.nombre) {
    const existe = await CreacionDeEquipo.findOne({ where: { nombre } });
    if (existe) return res.status(409).json({ message: 'Ya existe un equipo con este nombre, elige otro' });
  }

  // Verificar jugadores y entrenador libres
  const jugadoresOcupados = await Jugador.findAll({
    where: {
      equipoId: { [Op.ne]: null },
      id: jugadores,
      equipoId: { [Op.ne]: equipo.id } // Ya asignados a otro equipo
    },
  });

  if (jugadoresOcupados.length > 0) {
    return res.status(400).json({ message: 'Algunos jugadores ya están asignados a otro equipo' });
  }

  if (entrenador) {
    const entrenadorOcupado = await Entrenador.findOne({
      where: {
        id: entrenador,
        equipoId: { [Op.ne]: null },
        equipoId: { [Op.ne]: equipo.id }
      },
    });
    if (entrenadorOcupado) {
      return res.status(400).json({ message: 'Este entrenador ya está asignado a otro equipo' });
    }
  }

  // Actualizar equipo
  await equipo.update({ nombre, categoria, imagen });

  // Desasignar jugadores anteriores y asignar nuevos
  await Jugador.update({ equipoId: null }, { where: { equipoId: equipo.id } });
  await Jugador.update({ equipoId: equipo.id }, { where: { id: jugadores } });

  // Desasignar entrenador anterior
  await Entrenador.update({ equipoId: null }, { where: { equipoId: equipo.id } });
  if (entrenador) {
    await Entrenador.update({ equipoId: equipo.id }, { where: { id: entrenador } });
  }

  return res.json({ message: 'Equipo actualizado correctamente' });
};

// GET /jugadores/disponibles
const jugadoresDisponibles = async (req, res) => {
  const libres = await Jugador.findAll({ where: { equipoId: null } });
  if (libres.length === 0) return res.json({ message: 'No hay jugadores disponibles', jugadores: [] });
  res.json({ jugadores: libres });
};

// GET /entrenadores/disponibles
const entrenadoresDisponibles = async (req, res) => {
  const libres = await Entrenador.findAll({ where: { equipoId: null } });
  if (libres.length === 0) return res.json({ message: 'No hay entrenadores disponibles', entrenadores: [] });
  res.json({ entrenadores: libres });
};

module.exports = {
  crearEquipo,
  editarEquipo,
  jugadoresDisponibles,
  entrenadoresDisponibles
};
