const pool = require("../config/db");
const { Persona, Usuario, Jugador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

const verJugadores = async (req, res) => {
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

    // Ajustamos la estructura para el frontend
    const jugadores = response.map((jugador) => ({
      id: jugador.id,
      nombre: jugador.usuarios?.personas?.nombre || "Desconocido",
      apellido: jugador.usuarios?.personas?.apellido || "Desconocido",
      email: jugador.usuarios?.email || "Sin correo",
      posicion: jugador.posicion,
      altura: jugador.altura,
      peso: jugador.peso,
    }));

    return res.json(jugadores);
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener jugadores", detalle: error.message });
  }
};

const verJugador = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido en verJugador:", id);
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

const crearJugador = async (req, res) => {
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
    potencia_muscular_piernas,
    velocidad_max,
    resistencia_aerobica,
    resistencia_anaerobica,
    flexibilidad,
  } = req.body;
  try {
    // Validaciones básicas
    if (!email || !pass) {
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
        potencia_muscular_piernas,
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
const actualizarJugador = async (req, res) => {
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
      potencia_muscular_piernas,
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
      potencia_muscular_piernas,
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
const actualizarCapacidadJugador = async (req, res) => {
  const { id } = req.params;
  const {
    altura,
    peso,
    posicion,
    porcentaje_grasa_corporal,
    porcentaje_masa_muscular,
    tipo_cuerpo,
    potencia_muscular_piernas,
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
      potencia_muscular_piernas,
      velocidad_max,
      resistencia_aerobica,
      resistencia_anaerobica,
      flexibilidad,
    });

    return res.json({
      message: "Jugador actualizado",
      jugador: { jugador },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar jugador" });
  }
};

const eliminarJugador = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM jugadores WHERE id = $1", [id]);
    return res.json({ message: "Jugador eliminado", id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar jugador" });
  }
};

const verPerfil = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    const jugador = await Jugador.findOne({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "usuarios",
          include: [
            {
              model: Persona,
              as: "personas",
              attributes: ["nombre", "apellido", "telefono"],
            },
          ],
        },
      ],
    });

    if (!jugador || !jugador.usuarios || !jugador.usuarios.personas) {
      return res.status(404).json({
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND",
      });
    }

    const { nombre, apellido, telefono } = jugador.usuarios.personas;
    const { fecha_nacimiento } = jugador;

    const perfilCompleto = nombre && apellido && telefono && fecha_nacimiento;

    return res.json({
      success: true,
      perfilCompleto,
      datos: { nombre, apellido, telefono, fecha_nacimiento },
    });
  } catch (error) {
    console.error("Error al ver perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
      code: "FETCH_PROFILE_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const actualizarPerfil = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuarioId = req.user.id;
    const { nombre, apellido, telefono, fecha_nacimiento } = req.body;

    const jugador = await Jugador.findOne({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "usuarios",
          include: [
            {
              model: Persona,
              as: "personas",
            },
          ],
        },
      ],
      transaction: t,
    });

    if (!jugador || !jugador.usuarios || !jugador.usuarios.personas) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND",
      });
    }

    // Actualizar datos en Persona
    await jugador.usuarios.personas.update(
      { nombre, apellido, telefono },
      { transaction: t }
    );

    // Actualizar fecha de nacimiento en Jugador
    if (fecha_nacimiento) {
      await jugador.update({ fecha_nacimiento }, { transaction: t });
    }

    await t.commit();
    return res.json({ success: true, message: "Perfil actualizado correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar perfil",
      code: "PROFILE_UPDATE_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const obtenerJugadorPorUsuario = async (req, res) => {
  try {
    const { id } = req.params; // Este es el ID del usuario
    
    const jugador = await Jugador.findOne({
      where: { usuario_id: id },
      attributes: ['id'] // Solo necesitamos el ID del jugador
    });

    if (!jugador) {
      return res.status(404).json({ 
        mensaje: "No se encontró un jugador asociado a este usuario" 
      });
    }

    res.json(jugador);
  } catch (error) {
    console.error("Error al obtener jugador por usuario:", error);
    res.status(500).json({ 
      error: "Error al obtener el jugador",
      detalles: error.message 
    });
  }
};

module.exports = {
  verJugadores,
  verJugador,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  actualizarCapacidadJugador,
  verPerfil,
  actualizarPerfil,
  obtenerJugadorPorUsuario,
};
