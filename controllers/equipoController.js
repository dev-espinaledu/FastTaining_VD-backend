// const { Equipo, Jugador } = require("../models");
// const { PutObjectCommand } = require('@aws-sdk/client-s3');
// const s3 = require('../config/cloudflare');
// require('dotenv').config();

// // Función para subir imagen a Cloudflare R2
// const uploadToCloudflare = async (file) => {
//   const fileName = `equipos/${Date.now()}-${file.originalname}`;
//   const params = {
//     Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
//     Key: fileName,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   };

//   await s3.send(new PutObjectCommand(params));
//   return `https://${process.env.CLOUDFLARE_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;
// };

// // Crear un nuevo equipo
// const createTeam = async (req, res) => {
//   try {
//     console.log("📩 Datos recibidos en createTeam:", req.body);
//     console.log("📸 Archivo recibido:", req.file ? req.file.originalname : "Ninguno");

//     const { nombre, descripcion } = req.body;
//     let escudo_url = null;

//     if (req.file) {
//       escudo_url = await uploadToCloudflare(req.file);
//       console.log("✅ Imagen subida a Cloudflare:", escudo_url);
//     }

//     const nuevoEquipo = await Equipo.create({ nombre, escudo_url, descripcion });
//     console.log("✅ Equipo creado en la BD:", nuevoEquipo);

//     res.status(201).json({ message: "Equipo creado exitosamente", equipo: nuevoEquipo });
//   } catch (error) {
//     console.error("❌ Error en createTeam:", error);
//     res.status(500).json({ error: "Error al crear el equipo" });
//   }
// };


// // Obtener todos los equipos
// const getTeams = async (req, res) => {
//   try {
//     const equipos = await Equipo.findAll({
//       include: [
//         { association: 'entrenadores' },
//         { association: 'jugadores' },
//       ],
//     });

//     res.status(200).json(equipos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al obtener equipos' });
//   }
// };

// module.exports = { createTeam, getTeams };







const { Equipo, Jugador } = require("../models");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/cloudflare');
require('dotenv').config();

// Subir imagen a Cloudflare
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

// Crear un equipo
const createTeam = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    let escudo_url = null;

    if (req.file) {
      escudo_url = await uploadToCloudflare(req.file);
    }

    const nuevoEquipo = await Equipo.create({ nombre, escudo_url, descripcion });
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

// 🛠️ Actualizar equipo
// Editar equipo
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria } = req.body;
    let escudo_url = null;

    if (req.file) {
      escudo_url = await uploadToCloudflare(req.file);
    }

    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    await equipo.update({
      nombre: nombre || equipo.nombre,
      descripcion: descripcion || equipo.descripcion,
      categoria: categoria || equipo.categoria,
      escudo_url: escudo_url || equipo.escudo_url,
    });

    res.status(200).json({ message: 'Equipo actualizado', equipo });
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error);
    res.status(500).json({ error: 'Error al actualizar el equipo' });
  }
};


// 🧨 Eliminar equipo
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    await equipo.destroy();
    res.status(200).json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error("❌ Error en deleteTeam:", error);
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
};
