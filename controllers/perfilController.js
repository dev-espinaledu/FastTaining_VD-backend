const { Usuario, Persona, sequelize } = require("../models");
const { cloudinary, deleteImage } = require("../config/cloudinary");
const { uploadToCloudinary } = require("../middlewares/uploadMiddleware");

exports.actualizarPerfilUniversal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const usuarioId = req.params.id;
    const { nombre, apellido, telefono } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Nombre y apellido son obligatorios",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Buscar usuario con su persona asociada (usando el alias correcto)
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [
        {
          model: Persona,
          as: "personas", // Cambiado de 'persona' a 'personas'
        },
      ],
      transaction: t,
    });

    if (!usuario || !usuario.personas) {
      // Cambiado de persona a personas
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    const updateData = { nombre, apellido, telefono };

    // Manejo de imagen
    if (req.file) {
      try {
        // Eliminar imagen anterior si existe
        if (usuario.personas.foto_perfil) {
          // Cambiado de persona a personas
          await deleteImage(usuario.personas.foto_perfil);
        }

        // Subir nueva imagen
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "profiles",
          public_id: `user_${usuarioId}_${Date.now()}`,
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });

        updateData.foto_perfil = result.secure_url;
      } catch (uploadError) {
        await t.rollback();
        return res.status(500).json({
          success: false,
          message: "Error al procesar la imagen",
          code: "IMAGE_UPLOAD_ERROR",
        });
      }
    }

    // Actualizar datos usando el alias correcto
    await usuario.personas.update(updateData, { transaction: t }); // Cambiado de persona a personas
    await t.commit();

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        id: usuario.id,
        nombre,
        apellido,
        telefono: telefono || usuario.personas.telefono,
        foto_perfil: updateData.foto_perfil || usuario.personas.foto_perfil,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el perfil",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
};
