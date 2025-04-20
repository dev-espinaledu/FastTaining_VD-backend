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
  const usuarioId = req.user.id;
  const { nombre, apellido, telefono } = req.body;

  // Validar campos obligatorios
  if (!nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: "Nombre y apellido son obligatorios",
      code: "MISSING_REQUIRED_FIELDS"
    });
  }

  const t = await sequelize.transaction();
  try {
    // Buscar usuario con su persona asociada
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [{ 
        model: Persona, 
        as: 'personas' 
      }],
      transaction: t
    });

    if (!usuario || !usuario.personas) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND"
      });
    }

    // Actualizar solo datos personales
    await usuario.personas.update({ 
      nombre, 
      apellido, 
      telefono 
    }, { transaction: t });
    
    await t.commit();

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        id: usuario.id,
        email: usuario.email,
        nombre,
        apellido,
        telefono
      }
    });

  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      code: "SERVER_ERROR"
    });
  }
};

const actualizarImagenPerfil = async (req, res) => {
  const usuarioId = req.user.id;
  
  console.log('Iniciando actualización de imagen para usuario:', usuarioId);
  
  // Validación de archivo recibido
  if (!req.file) {
    console.error('No se recibió archivo en la solicitud');
    return res.status(400).json({
      success: false,
      message: "No se ha proporcionado ninguna imagen",
      code: "NO_IMAGE_PROVIDED",
      details: "El campo 'foto_perfil' está vacío o no se envió correctamente"
    });
  }

  console.log('Archivo recibido:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    bufferLength: req.file.buffer?.length || 0
  });

  const t = await sequelize.transaction();
  try {
    // Buscar usuario con su persona asociada
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [{ 
        model: Persona, 
        as: 'personas' 
      }],
      transaction: t
    });

    if (!usuario) {
      await t.rollback();
      console.error('Usuario no encontrado con ID:', usuarioId);
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
        details: `No existe usuario con ID ${usuarioId}`
      });
    }

    if (!usuario.personas) {
      await t.rollback();
      console.error('Registro de persona no encontrado para usuario:', usuarioId);
      return res.status(404).json({
        success: false,
        message: "Datos de perfil no encontrados",
        code: "PROFILE_NOT_FOUND",
        details: "El usuario existe pero no tiene registro de persona asociado"
      });
    }

    // Eliminar imagen anterior si existe
    if (usuario.personas.foto_perfil) {
      try {
        console.log('Eliminando imagen anterior:', usuario.personas.foto_perfil);
        await deleteImage(usuario.personas.foto_perfil);
        console.log('Imagen anterior eliminada con éxito');
      } catch (error) {
        console.error("Error al eliminar imagen anterior:", error.message);
        // Continuamos aunque falle la eliminación
      }
    }

    // Configuración de transformación para Cloudinary
    const uploadOptions = {
      folder: 'user-profiles',
      public_id: `user_${usuarioId}_${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ],
      async: false // Procesamiento sincrónico
    };

    console.log('Subiendo imagen a Cloudinary con opciones:', uploadOptions);
    
    // Subir nueva imagen
    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);
    
    console.log('Respuesta de Cloudinary:', {
      status: result.status,
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format
    });

    if (!result.secure_url) {
      throw new Error('Cloudinary no devolvió URL segura en la respuesta');
    }

    // Optimizar URL (forzar HTTPS y formato automático)
    const optimizedUrl = result.secure_url
      .replace('http://', 'https://')
      .replace('/upload/', '/upload/q_auto,f_auto/');

    // Actualizar en base de datos
    await usuario.personas.update({ 
      foto_perfil: optimizedUrl 
    }, { transaction: t });
    
    await t.commit();
    
    console.log('Imagen actualizada correctamente en BD:', optimizedUrl);

    return res.json({
      success: true,
      message: "Imagen de perfil actualizada correctamente",
      data: {
        foto_perfil: optimizedUrl,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    await t.rollback();
    
    console.error("Error completo en actualizarImagenPerfil:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      originalError: error.original
    });
    
    let errorMessage = "Error al actualizar la imagen de perfil";
    let errorCode = "IMAGE_UPDATE_ERROR";
    let details = null;

    if (error.message.includes('File size too large')) {
      errorMessage = "La imagen es demasiado grande (máximo 5MB)";
      errorCode = "IMAGE_TOO_LARGE";
    } else if (error.message.includes('Invalid image file')) {
      errorMessage = "Formato de imagen no válido";
      errorCode = "INVALID_IMAGE_FORMAT";
    } else if (error.message.includes('Cloudinary')) {
      errorMessage = "Error en el servicio de almacenamiento de imágenes";
      errorCode = "CLOUDINARY_ERROR";
      details = process.env.NODE_ENV === 'development' ? error.message : null;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        stack: error.stack
      } : null
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
  actualizarImagenPerfil,
  cambiarContrasena
};
