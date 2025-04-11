const { Persona } = require("../models");
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const obtenerPersonas = async (req, res) => {
  try {
    const personas = await Persona.findAll({
      attributes: ['id', 'nombre', 'apellido', 'telefono', 'foto_perfil']
    });
    
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error("Error al obtener personas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la lista de personas",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const obtenerPersonaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "ID de persona no válido",
        code: "INVALID_ID"
      });
    }

    const persona = await Persona.findByPk(id, {
      attributes: ['id', 'nombre', 'apellido', 'telefono', 'foto_perfil']
    });

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona no encontrada",
        code: "PERSONA_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error("Error al obtener persona:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la persona",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarPersona = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono } = req.body;

    // Validar permisos
    if (req.user.id != id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar este perfil",
        code: "FORBIDDEN"
      });
    }

    const persona = await Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona no encontrada",
        code: "PERSONA_NOT_FOUND"
      });
    }

    const updateData = { nombre, apellido, telefono };

    // Manejar la imagen si se subió
    if (req.file) {
      try {
        // Eliminar imagen anterior de Cloudinary si existe
        if (persona.foto_perfil) {
          // Extraer el public_id de la URL de Cloudinary
          const publicId = persona.foto_perfil.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
        }

        // Subir nueva imagen a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
          width: 500,
          height: 500,
          crop: 'limit'
        });

        // Eliminar archivo temporal
        fs.unlinkSync(req.file.path);

        updateData.foto_perfil = result.secure_url;
      } catch (uploadError) {
        console.error("Error al subir imagen a Cloudinary:", uploadError);
        // Eliminar archivo temporal si existe
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
          success: false,
          message: "Error al subir la imagen",
          code: "IMAGE_UPLOAD_ERROR"
        });
      }
    }

    await persona.update(updateData);

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        id: persona.id,
        nombre: persona.nombre,
        apellido: persona.apellido,
        telefono: persona.telefono,
        foto_perfil: persona.foto_perfil
      }
    });
  } catch (error) {
    console.error("Error al actualizar persona:", error);
    // Eliminar archivo temporal si existe
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Error al actualizar el perfil",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  obtenerPersonas,
  obtenerPersonaPorId,
  actualizarPersona
};