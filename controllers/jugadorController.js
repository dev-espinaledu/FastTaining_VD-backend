const pool = require("../config/db");
const { Usuario } = require("../models");
const { Persona } = require("../models");
const { Jugador } = require("../models");
const bcrypt = require("bcrypt");

exports.verJugadores = async (req, res) => {
  try {
    const response = await Jugador.findAll();
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener jugadores" });
  }
};

exports.crearJugador = async (req, res) => {
  const {
    nombre,
    apellido,
    telefono,
    email,
    pass,
    fecha_nacimiento,
    posicion,
    altura,
    frecuencia_cardiaca,
    peso,
    resistencia,
    fuerza,
    velocidad,
    potencia,
    equipo_id,
  } = req.body;
  try {
    let password = await bcrypt.hash(pass, 10);
    const persona = await Persona.create({ nombre, apellido, telefono });
    const usuario = await Usuario.create({
      email,
      password,
      persona_id: persona.id,
      rol_id: 2,
    });
    const jugador = await Jugador.create({
      fecha_nacimiento,
      posicion,
      altura,
      frecuencia_cardiaca,
      peso,
      resistencia,
      fuerza,
      velocidad,
      potencia,
      equipo_id,
    });

    return res.json({
      message: "Jugador creado",
      jugador: { fecha_nacimiento, posicion, altura },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear jugador" });
  }
};

exports.actualizarJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      telefono,
      email,
      pass,
      fecha_nacimiento,
      posicion,
      altura,
      frecuencia_cardiaca,
      peso,
      resistencia,
      fuerza,
      velocidad,
      potencia,
      equipo_id,
    } = req.body;

    const jugador = await Jugador.findByPk(id, {
      include: [{ model: Usuario, include: [Persona] }]
    });

    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    await jugador.Usuario.Persona.update({ nombre, apellido, telefono });


    if (email) {
      await jugador.Usuario.update({ email });
    }


    if (pass) {
      const password = await bcrypt.hash(pass, 10);
      await jugador.Usuario.update({ password });
    }

    await jugador.update({
      fecha_nacimiento,
      posicion,
      altura,
      frecuencia_cardiaca,
      peso,
      resistencia,
      fuerza,
      velocidad,
      potencia,
      equipo_id,
    });

    return res.json({ message: "Jugador actualizado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar jugador" });
  }
};


exports.verJugador = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await pool.query("SELECT * FROM jugadores WHERE id = $1", [
      id,
    ]);
    if (response.rows.length === 0)
      return res.status(404).json({ error: "Jugador no encontrado" });
    return res.json(response.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener jugador" });
  }
};

exports.actualizarCapacidadJugador = async (req, res) => {
  const { id } = req.params;
  const {
    posicion,
    altura,
    frecuencia_cardiaca,
    peso,
    resistencia,
    fuerza,
    velocidad,
    potencia,
  } = req.body;
  try {
    const jugador = await Jugador.findByPk(id);
    if (!jugador)
      return res.status(404).json({ error: "Jugador no encontrado" });

    return res.json({
      message: "Jugador actualizado",
      jugador: { fecha_nacimiento, posicion, altura },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar jugador" });
  }
};

exports.eliminarJugador = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM jugadores WHERE id = $1", [id]);
    return res.json({ message: "Jugador eliminado", id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar jugador" });
  }
};
