const { Usuario, Persona } = require("../models");
const bcrypt = require("bcryptjs");

exports.obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario autenticado solo pueda ver su propio perfil
  if (req.user.id != id && req.user.role !== 1) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para acceder a este recurso",
      code: "FORBIDDEN"
    });
  }

  try {
    const usuario = await Usuario.findByPk(id, {
      include: [
        { 
          model: Persona,
          as: 'personas',
          attributes: ['nombre', 'apellido', 'telefono'/* , 'foto' */]
        }
      ],
      attributes: ['id', 'email', 'rol_id']
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        nombre: usuario.personas?.nombre,
        apellido: usuario.personas?.apellido,
        telefono: usuario.personas?.telefono,
        /* foto: usuario.personas?.foto */
      }
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};

exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono/* , foto  */} = req.body;

  // Verificar que el usuario solo pueda modificar su propio perfil
  if (req.user.id != id) {
    return res.status(403).json({
      success: false,
      message: "Solo puedes modificar tu propio perfil",
      code: "FORBIDDEN"
    });
  }

  // Validar campos obligatorios
  if (!nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: "Nombre y apellido son obligatorios",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  try {
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Persona, as: 'personas' }]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Actualizar datos de persona asociada
    await usuario.personas.update({
      nombre,
      apellido,
      telefono,
      /* foto */
    });

    res.json({
      success: true,
      message: "Información actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};

exports.cambiarContrasena = async (req, res) => {
  const { id } = req.params;
  const { contrasenaActual, nuevaContrasena, confirmacionContrasena } = req.body;

  // Verificar que el usuario solo pueda cambiar su propia contraseña
  if (req.user.id != id) {
    return res.status(403).json({
      success: false,
      message: "Solo puedes cambiar tu propia contraseña",
      code: "FORBIDDEN"
    });
  }

  // Validar campos obligatorios
  if (!contrasenaActual || !nuevaContrasena || !confirmacionContrasena) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  // Validar que las nuevas contraseñas coincidan
  if (nuevaContrasena !== confirmacionContrasena) {
    return res.status(400).json({
      success: false,
      message: "Las contraseñas no coinciden",
      code: "PASSWORD_MISMATCH"
    });
  }

  // Validar criterios de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(nuevaContrasena)) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
      code: "INVALID_PASSWORD_FORMAT"
    });
  }

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Verificar contraseña actual
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.password);
    if (!contrasenaValida) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
        code: "INVALID_CURRENT_PASSWORD"
      });
    }

    // Hashear y guardar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR"
    });
  }
};
const { Persona, Usuario, Jugador, Entrenador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");


const CrearUsuario = async (req,res)=>{
  try{

  }catch(e){
    console.log()
    return res.status(500).json({mjs:`Error desde el método CrearUsuario ${e}`})
  }
}
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
