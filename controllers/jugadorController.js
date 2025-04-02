const pool = require("../config/db");
const { Persona, Usuario, Jugador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

exports.verJugadores = async (req, res) => {
  try {
    const response = await Jugador.findAll({
      attributes: { exclude: ["frecuencia_cardiaca"] },
      include: [
        {
          model: Usuario,
          as: "usuarios", // Usa el alias definido en la relación
          attributes: ["email"],
          include: [
            {
              model: Persona,
              as: "personas", // Usa el alias definido en la relación
              attributes: ["nombre", "apellido"],
            },
          ],
        },
      ],
    });

    const jugadores = response.map((jugador) => ({
      id: jugador.id,
      nombre: jugador.usuarios?.personas?.nombre || "Desconocido", // Usa el alias correcto
      apellido: jugador.usuarios?.personas?.apellido || "Desconocido",
      email: jugador.usuarios?.email || "Sin correo",
      posicion: jugador.posicion,
      altura: jugador.altura,
      peso: jugador.peso,
    }));

    return res.json(jugadores);
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return res.status(500).json({ error: "Error al obtener jugadores" });
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

exports.crearJugador = async (req, res) => {
  const t = await sequelize.transaction(); // Iniciar transacción

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
        resistencia_aerobica,
        resistencia_anaerobica,
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

// Esta función está hecha para el admin, controla todo los aspectos del jugador, como usuario, persona y jugador
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
      include: [{ model: Usuario, include: [Persona] }],
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

// Esta función es para que el entrenador registre datos físicos del jugador.
exports.actualizarCapacidadJugador = async (req, res) => {
  const { id } = req.params;
  const {
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
    const jugador = await Jugador.findByPk(id);
    if (!jugador)
      return res.status(404).json({ error: "Jugador no encontrado" });

    await jugador.update({
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
