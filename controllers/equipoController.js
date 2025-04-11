const { Equipo, Jugador } = require("../models");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/cloudflare');
require('dotenv').config();

// Función para subir imagen a Cloudflare R2
const uploadToCloudflare = async (file) => {
  const fileName = `equipos/${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));
  return `https://${process.env.CLOUDFLARE_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;
};

// Crear un nuevo equipo
const createTeam = async (req, res) => {
  try {
    console.log("📩 Datos recibidos en createTeam:", req.body);
    console.log("📸 Archivo recibido:", req.file ? req.file.originalname : "Ninguno");

    const { nombre, descripcion } = req.body;
    let escudo_url = null;

    if (req.file) {
      escudo_url = await uploadToCloudflare(req.file);
      console.log("✅ Imagen subida a Cloudflare:", escudo_url);
    }

    const nuevoEquipo = await Equipo.create({ nombre, escudo_url, descripcion });
    console.log("✅ Equipo creado en la BD:", nuevoEquipo);

    res.status(201).json({ message: "Equipo creado exitosamente", equipo: nuevoEquipo });
  } catch (error) {
    console.error("❌ Error en createTeam:", error);
    res.status(500).json({ error: "Error al crear el equipo" });
  }
};


// Obtener todos los equipos
const getTeams = async (req, res) => {
  try {
    const equipos = await Equipo.findAll({
      include: [
        { association: 'entrenadores' },
        { association: 'jugadores' },
      ],
    });

    res.status(200).json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

const obtenerEquipoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await Equipo.findByPk(id, {
      include: [
        { association: 'entrenadores' },
        { association: 'jugadores' },
      ],
    });

    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.status(200).json(equipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el equipo' });
  }
}

module.exports = { createTeam, getTeams, obtenerEquipoPorId };
