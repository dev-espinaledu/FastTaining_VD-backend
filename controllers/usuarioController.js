const { Usuario, Persona, Jugador, Entrenador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const {correoContraseña}=require('../utils/EmailPasword')

dotenv.config();

function generarPasswordAzar(){
  //Lista de caracteres que van dentro de la contraseña
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+';
  //Variable en la que se almacenará la contraseña
  let password = '';
  const longitud= 11;
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}

// ----------------------------------------------------------
const CrearUsuario = async (req,res)=>{
  const {email, rol}= req.body;
  const t = await sequelize.transaction(); 
  try{
    if (!email || !rol) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    //Verifica que el usuario no existe 
    const exist = await Usuario.findOne({where:{email}});
    if (exist){
      return res.status(400).json({ error: "El correo ya está registrado" })
    };
    //Rol id
    const roles = {
      administrador: 1,
      entrenador: 2,
      jugador: 3,
    };
    const rol_id = roles[rol.toLowerCase()];
    if (!rol_id) {
      return res.status(400).json({ error: "Rol inválido" });
    }
    //Crear la contraseña del usuario al azar
    const passAleatorea = generarPasswordAzar(); // Contraseña aleatorea creada por la función anterior
    const hashedPassword = await bcrypt.hash(passAleatorea, 10);

    //Crear el id de persona
    const persona = await Persona.create(
      { nombre: null, apellido:null, telefono: null  },
      { transaction: t }
    );
    //Crear el usuario 
    const usuario = await Usuario.create(
      {
        email,
        password:hashedPassword,
        persona_id: persona.id,
        rol_id, // Rol asignador
      },
      { transaction: t }
    );
    let data ={}
    //Crear jugador o entrenador
    if(rol_id ==2){
      const entrenador = await Entrenador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={entrenador};
    }else if(rol_id ==3){
      const jugador = await Jugador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={jugador};
    }
    // Confirmar transacción
    console.log("Usuario creado correctamente");

    //Enviar Correo
    await correoContraseña(email, passAleatorea);
    res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
    console.log(passAleatorea);
    await t.commit();
  }catch(e){
    await t.rollback(); 
    console.log("Error en CrearUsuario", e)
    return res.status(500).json({mjs:`Error desde el método CrearUsuario ${e}`})
  }
}


//------------------------------------------------------------------
const obtenerUsuarioPorId = async (req, res) => {
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

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono } = req.body;

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
      // Solo actualizar foto si se subió una nueva
      ...(req.file && { foto_perfil: req.file.path })
    });

    res.json({
      success: true,
      message: "Información actualizada correctamente",
      data: {
        nombre,
        apellido,
        telefono,
        foto_perfil: req.file ? req.file.path : usuario.personas.foto_perfil
      }
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

const cambiarContrasena = async (req, res) => {
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
      message: "Error al cambiar la contraseña",
      code: "PASSWORD_CHANGE_ERROR"
    });
  }
};

const crearAdmin = async (req, res) => {
  const { email, password, nombre, apellido, telefono } = req.body;

  // Validar campos obligatorios
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son obligatorios",
      code: "MISSING_REQUIRED_FIELDS",
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Formato de email inválido",
      code: "INVALID_EMAIL_FORMAT",
    });
  }

  // Validar criterios de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
      code: "INVALID_PASSWORD_FORMAT",
    });
  }

  // Validar que el email no esté ya registrado
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    return res.status(400).json({
      success: false,
      message: "El email ya está registrado",
      code: "EMAIL_ALREADY_REGISTERED",
    });
  }

  const t = await sequelize.transaction(); // Iniciar transacción
  try {
    // Crear nuevo usuario administrador
    const hashedPassword = await bcrypt.hash(password, 10);

    //Enviar correo

    //Crear el id de persona
    const persona = await Persona.create(
      { nombre: null, apellido:null, telefono: null  },
      { transaction: t }
    );
    //Crear el usuario 
    const usuario = await Usuario.create(
      {
        email,
        password:hashedPassword,
        persona_id: persona.id,
        rol_id, // Rol asignador
      },
      { transaction: t }
    );

    let data ={}
    //Crear jugador o entrenador
    if(rol_id ==2){
      const entrenador = await Entrenador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={entrenador};
    }else if(rol_id ==3){
      const jugador = await Jugador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={jugador};
    }

    // Confirmar transacción
    console.log("Usuario creado correctamente");

    await correoContraseña(email, passAleatorea);

    res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
    await t.commit();


  }catch(e){
    await t.rollback(); 
    console.log("Error en CrearUsuario", e)
    return res.status(500).json({mjs:`Error desde el método CrearUsuario ${e}`})
  }
}

//-------------------------------------------------------------------------------------------

const obtenerUsers = async(req, res)=>{
  try{
    console.log("Está accediento a la obtenerUsers")
    const usuarios = await Usuario.findAll({});
    const usuariosPlano = usuarios.map(user => user.get());
    return res.json(usuariosPlano);
  }catch(e){
    console.error(`Error desde verUsuarios: ${e}`)
    return res.status(500).json({mjs:`Error desde el verUsuarios: ${e}`})
  }
}

module.exports = {
  CrearUsuario,
  obtenerUsers,
  obtenerUsuarioPorId,
  actualizarUsuario,
  cambiarContrasena,
  crearAdmin
};
// Exportar las funciones para su uso en otras partes de la aplicación