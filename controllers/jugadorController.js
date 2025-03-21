const pool = require("../config/db");
const { Persona, Usuario, Jugador, sequelize } = require("../models");
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
  const t = await sequelize.transaction(); // Iniciar transacción

  try {
    const {
      nombre,
      apellido,
      telefono,
      email,
      pass,
      fecha_nacimiento,
      altura,
      peso,
      posicion,
      porcentaje_grasa_corporal,
      porcentaje_masa_muscular,
      tipo_cuerpo,
      fuerza,
      velocidad_max,
      frecuencia_cardiaca,
      resistencia,
      resistencia_cardiovascular,
      resistencia_muscular,
      flexibilidad,
      equipo_id,
    } = req.body;

    // Validaciones básicas
    if (
      !nombre ||
      !apellido ||
      !email ||
      !pass ||
      !fecha_nacimiento ||
      !posicion
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Verificar si el email ya está en uso
    const emailExiste = await Usuario.findOne({ where: { email } });
    if (emailExiste) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const password = await bcrypt.hash(pass, 10);

    // Crear Persona
    const persona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    // Crear Usuario
    const usuario = await Usuario.create(
      {
        email,
        password,
        persona_id: persona.id,
        rol_id: 3, // Suponiendo que "3" es el rol de jugador
      },
      { transaction: t },
    );

    // Crear Jugador y asociarlo al usuario
    const jugador = await Jugador.create(
      {
        fecha_nacimiento,
        altura,
        peso,
        posicion,
        porcentaje_grasa_corporal,
        porcentaje_masa_muscular,
        tipo_cuerpo,
        fuerza,
        velocidad_max,
        frecuencia_cardiaca,
        resistencia,
        resistencia_cardiovascular,
        resistencia_muscular,
        flexibilidad,
        equipo_id,
        usuario_id: usuario.id, // Asociar con el usuario recién creado
      },
      { transaction: t },
    );

    // Confirmar transacción
    await t.commit();

    return res.json({
      message: "Jugador creado exitosamente",
      jugador: {
        id: jugador.id,
        nombre,
        apellido,
        email,
        posicion,
        altura,
        peso,
      },
    });
  } catch (error) {
    await t.rollback(); // Revertir cambios en caso de error
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
