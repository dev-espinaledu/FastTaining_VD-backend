/* const { Persona, Usuario, Jugador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

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
    potencia_muscular_piernas,
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
 */