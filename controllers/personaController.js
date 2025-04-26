const { Persona } = require("../models");
const { cloudinary } = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middlewares/uploadMiddleware');
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

// Función para extraer el public_id de una URL de Cloudinary
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Tomar todas las partes después de 'upload' y antes del formato
    const relevantParts = pathParts.slice(uploadIndex + 1);
    const publicIdWithFormat = relevantParts.join('/');
    const publicId = publicIdWithFormat.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error("Error al extraer public_id:", error);
    return null;
  }
};

module.exports = {
  obtenerPersonas,
  obtenerPersonaPorId,
};