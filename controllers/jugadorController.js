const { Persona, Usuario, Jugador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");


// Función para agregar mas de un jugador
const cargarJugadores = async (req, res) => {
  try {
    const jugadores = req.body.jugadores;

    if (!jugadores || !Array.isArray(jugadores)) {
      return res.status(400).json({
        success: false,
        message: "Formato de datos inválido",
        code: "INVALID_DATA_FORMAT",
      });
    }
    const jugadoresCreados = await Promise.all(
      jugadores.map(async (jugador) => {
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
        } = jugador;
        if (!email || !pass) {
          return {
            success: false,
            message: "Email y contraseña son obligatorios",
            code: "MISSING_REQUIRED_FIELDS",
          };
        }
        const emailExiste = await Usuario.findOne({ where: { email } });
        if (emailExiste) {
          return {
            success: false,
            message: "El correo ya está registrado",
            code: "EMAIL_ALREADY_EXISTS",
          };
        }
        const password = await bcrypt.hash(pass, 10);
        const persona = await Persona.create({
          nombre,
          apellido,
          telefono,
        });
        const usuario = await Usuario.create({
          email,
          password,
          persona_id: persona.id,
          rol_id: 3,
        });
        const jugadorCreado = await Jugador.create({
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
          usuario_id: usuario.id,
        });
        return {
          success: true,
          message: "Jugador creado exitosamente",
          data: {
            id: jugadorCreado.id,
            nombre,
            apellido,
            email,
            posicion,
            altura,
            peso,
          },
        };
      }),
    );
    res.status(201).json({
      success: true,
      message: "Jugadores creados exitosamente",
      data: jugadoresCreados,
    });
  } catch (error) {
    console.error("Error al cargar jugadores:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar jugadores",
      code: "LOAD_PLAYERS_ERROR",
    });
  }
};

const verJugadores = async (req, res) => {
  try {
    const jugadores = await Jugador.findAll({
      attributes: { exclude: ["frecuencia_cardiaca"] },
      include: [
        {
          model: Usuario,
          as: "usuarios",
          attributes: ["email"],
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

    res.json({
      success: true,
      data: jugadores.map((j) => ({
        id: j.id,
        nombre: j.usuarios?.personas?.nombre || "Desconocido",
        apellido: j.usuarios?.personas?.apellido || "Desconocido",
        email: j.usuarios?.email || "Sin correo",
        telefono: j.usuarios?.personas?.telefono || "",
        fecha_nacimiento: j.fecha_nacimiento,
        posicion: j.posicion,
        altura: j.altura,
        peso: j.peso,
      })),
    });
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener jugadores",
      code: "FETCH_PLAYERS_ERROR",
    });
  }
};

const verJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const jugador = await Jugador.findByPk(id, {
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

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
        code: "PLAYER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        id: jugador.id,
        nombre: jugador.usuarios?.personas?.nombre,
        apellido: jugador.usuarios?.personas?.apellido,
        email: jugador.usuarios?.email,
        telefono: jugador.usuarios?.personas?.telefono,
        fecha_nacimiento: jugador.fecha_nacimiento,
        posicion: jugador.posicion,
        altura: jugador.altura,
        peso: jugador.peso,
      },
    });
  } catch (error) {
    console.error("Error al obtener jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener jugador",
      code: "FETCH_PLAYER_ERROR",
    });
  }
};

const crearJugador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
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

    if (!email || !pass) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    const emailExiste = await Usuario.findOne({ where: { email } });
    if (emailExiste) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "El correo ya está registrado",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const password = await bcrypt.hash(pass, 10);

    const persona = await Persona.create(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    const usuario = await Usuario.create(
      {
        email,
        password,
        persona_id: persona.id,
        rol_id: 3,
      },
      { transaction: t },
    );

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
        usuario_id: usuario.id,
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({
      success: true,
      message: "Jugador creado exitosamente",
      data: {
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
    await t.rollback();
    console.error("Error al crear jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear jugador",
      code: "CREATE_PLAYER_ERROR",
    });
  }
};

const actualizarJugador = async (req, res) => {
  const t = await sequelize.transaction();
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
        message: "Jugador no encontrado",
        code: "PLAYER_NOT_FOUND",
      });
    }

    await jugador.usuarios.personas.update(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    if (email) {
      await jugador.usuarios.update({ email }, { transaction: t });
    }

    if (pass) {
      const password = await bcrypt.hash(pass, 10);
      await jugador.usuarios.update({ password }, { transaction: t });
    }

    await jugador.update(
      {
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
      },
      { transaction: t },
    );

    await t.commit();
    res.json({
      success: true,
      message: "Jugador actualizado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar jugador",
      code: "UPDATE_PLAYER_ERROR",
    });
  }
};

const actualizarCapacidadJugador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
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

    const jugador = await Jugador.findByPk(id, { transaction: t });

    if (!jugador) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
        code: "PLAYER_NOT_FOUND",
      });
    }

    await jugador.update(
      {
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
      },
      { transaction: t },
    );

    await t.commit();
    res.json({
      success: true,
      message: "Datos físicos del jugador actualizados",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar capacidad del jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar capacidad del jugador",
      code: "UPDATE_PLAYER_CAPACITY_ERROR",
    });
  }
};

const eliminarJugador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const jugador = await Jugador.findByPk(id, { transaction: t });
    if (!jugador) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
        code: "PLAYER_NOT_FOUND",
      });
    }

    await jugador.destroy({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: "Jugador eliminado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar jugador",
      code: "DELETE_PLAYER_ERROR",
    });
  }
};

// Función auxiliar para buscar jugador y validar relaciones
const obtenerJugadorConUsuario = async (usuarioId) => {
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
    return null;
  }

  return jugador;
};

// Funciones específicas para el perfil
const verPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const jugador = await obtenerJugadorConUsuario(usuarioId);

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: "Perfil no encontrado",
        code: "PROFILE_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        nombre: jugador.usuarios.personas.nombre,
        apellido: jugador.usuarios.personas.apellido,
        telefono: jugador.usuarios.personas.telefono,
        fecha_nacimiento: jugador.fecha_nacimiento,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
      code: "FETCH_PROFILE_ERROR",
    });
  }
};

const actualizarPerfil = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuarioId = req.user.id;
    const { nombre, apellido, telefono, fecha_nacimiento } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Nombre y apellido son obligatorios",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    if (telefono && !/^[0-9]{10,15}$/.test(telefono)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Formato de teléfono inválido",
        code: "INVALID_PHONE_FORMAT",
      });
    }

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

    await jugador.usuarios.personas.update(
      { nombre, apellido, telefono },
      { transaction: t },
    );

    if (fecha_nacimiento) {
      await jugador.update({ fecha_nacimiento }, { transaction: t });
    }

    await t.commit();
    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar perfil",
      code: "UPDATE_PROFILE_ERROR",
    });
  }
};

const verificarPerfilCompleto = async (req, res) => {
  try {
    const userId = req.params.userId
    const jugador = await obtenerJugadorConUsuario(userId);

    if (!jugador) {
      return res.json({
        success: true,
        profileComplete: false,
      });
    }

    const { nombre, apellido, telefono } = jugador.usuarios.personas;
    const camposRequeridos = {
      nombre,
      apellido,
      telefono,
      fecha_nacimiento: jugador.fecha_nacimiento,
    };

    const perfilCompleto = Object.values(camposRequeridos).every((val) => val);

    res.json({
      success: true,
      profileComplete: perfilCompleto,
    });
  } catch (error) {
    console.error("Error verificando perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar perfil",
      code: "CHECK_PROFILE_ERROR",
    });
  }
};

// Función para obtener el id de un jugador con su Idusuario, usada en el JugadorDataContext
const obtenerIdJugadorConUsuario = async (req, res) => {
  try {
    console.log("Obteniendo jugador por usuario");
    const { id } = req.params;
    console.log("ID del usuario:", id);

    const jugador = await Jugador.findOne({
      where: { usuario_id: id },
      attributes: ["id"],
    });
    console.log("Jugador encontrado:", jugador);
    console.log("Jugador id:", jugador.id);

    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
        code: "PLAYER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      id: jugador.id,
    });
  } catch (error) {
    console.error("Error al obtener jugador por usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener jugador",
      code: "FETCH_PLAYER_ERROR",
    });
  }
};

module.exports = {
  cargarJugadores,
  verJugadores,
  verJugador,
  crearJugador,
  actualizarJugador,
  actualizarCapacidadJugador,
  eliminarJugador,
  verPerfil,
  actualizarPerfil,
  verificarPerfilCompleto,
  obtenerIdJugadorConUsuario,
};
