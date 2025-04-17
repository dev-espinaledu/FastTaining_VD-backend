const { Usuario, Persona, sequelize } = require("../models");
const { cloudinary, deleteImage } = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middlewares/uploadMiddleware');
const bcrypt = require("bcryptjs");

const nodemailer = require('nodemailer');
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
    }

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

const obtenerUsuarioActual = async (req, res) => {
  try {
    // Verificación de autenticación más robusta
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "No autenticado",
        code: "UNAUTHORIZED",
        details: "Token de usuario no encontrado"
      });
    }

    // Obtener usuario con datos relacionados
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: ['id', 'email', 'rol_id', 'persona_id'],
      include: [
        { 
          model: Persona,
          as: 'personas', // Asegúrate que coincida con tu asociación
          attributes: ['id', 'nombre', 'apellido', 'telefono', 'foto_perfil']
        }
      ],
      rejectOnEmpty: true // Forzar error si no se encuentra
    });

    if (!usuario || !usuario.personas) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
        details: "El ID del usuario no existe en la base de datos"
      });
    }

    // Mapear nombres de roles
    const roles = {
      1: 'admin',
      2: 'entrenador',
      3: 'jugador'
    };

    // Formatear respuesta
    const responseData = {
      id: usuario.id,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: roles[usuario.rol_id] || 'desconocido',
      nombre: usuario.personas.nombre,
      apellido: usuario.personas.apellido,
      telefono: usuario.personas.telefono,
      foto_perfil: usuario.personas.foto_perfil 
        ? `${usuario.personas.foto_perfil}?t=${Date.now()}` // Cache busting
        : '/default-profile.png'
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error al obtener usuario:', {
      error: error.message,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const statusCode = error.name === 'SequelizeEmptyResultError' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : undefined,
      details: process.env.NODE_ENV === 'development'
        ? { stack: error.stack }
        : undefined
    });
  }
};

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
    // Buscar usuario con su persona asociada
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Persona, as: 'personas' }]
    });

    if (!usuario || !usuario.personas) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    const updateData = { nombre, apellido, telefono };

    // Manejar la imagen si se subió
    if (req.file) {
      try {
        // Eliminar imagen anterior si existe
        if (usuario.personas.foto_perfil) {
          await deleteImage(usuario.personas.foto_perfil);
        }

        // Subir nueva imagen a Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'profile_pictures',
          public_id: `user_${id}_${Date.now()}`,
          overwrite: false,
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        updateData.foto_perfil = result.secure_url;
      } catch (uploadError) {
        console.error("Error al subir imagen:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error al procesar la imagen",
          code: "IMAGE_UPLOAD_ERROR",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Actualizar datos de persona
    await usuario.personas.update(updateData);

    // Obtener datos actualizados
    const updatedPersona = await Persona.findByPk(usuario.personas.id);

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        id: usuario.id,
        email: usuario.email,
        nombre: updateData.nombre || usuario.personas.nombre,
        apellido: updateData.apellido || usuario.personas.apellido,
        telefono: updateData.telefono || usuario.personas.telefono,
        foto_perfil: updateData.foto_perfil || usuario.personas.foto_perfil
      }
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

module.exports = {
  CrearUsuario,
  obtenerUsuarioActual,
  obtenerUsuarioPorId,
  actualizarUsuario,
  cambiarContrasena
};
