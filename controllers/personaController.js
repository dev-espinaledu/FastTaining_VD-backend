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
        // Eliminar imagen anterior si existe
        if (persona.foto_perfil && persona.foto_perfil.startsWith('/uploads')) {
          const oldImagePath = path.join(__dirname, '../../public', persona.foto_perfil);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Guardar nueva imagen en el sistema de archivos
        const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.promises.rename(req.file.path, filePath);

        updateData.foto_perfil = `/uploads/profiles/${fileName}`;
      } catch (uploadError) {
        console.error("Error al subir imagen:", uploadError);
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