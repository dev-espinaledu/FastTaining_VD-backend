const pool = require("../config/db");
const { Usuario } = require("../models");
const { Persona } = require("../models");
const { Jugador } = require("../models");
const bcrypt = require("bcryptjs");

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
    equipo_id,
    fecha_nacimiento,
    altura,
    peso,
    posicion,
    porcentaje_grasa_corporal,
    porcentaje_masa_muscular,
    tipo_cuerpo,
    fuerza,
    velocidad_max,
    resistencia_aerobica,
    resistencia_anaerobica,
    flexibilidad,
  } = req.body;
  try {
    let password = await bcrypt.hash(pass, 10);
    const persona = await Persona.create({ nombre, apellido, telefono });
    const usuario = await Usuario.create({
      email,
      password,
      persona_id: persona.id,
      rol_id: 3,
    });
    const jugador = await Jugador.create({
      usuario_id:usuario.id,
      equipo_id,
      fecha_nacimiento,
      altura,
      peso,
      posicion,
      porcentaje_grasa_corporal,
      porcentaje_masa_muscular,
      tipo_cuerpo,
      fuerza,
      velocidad_max,
      resistencia_aerobica,
      resistencia_anaerobica,
      flexibilidad,
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
