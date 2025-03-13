const bcrypt = require("bcrypt");
const { Usuario } = require("../models"); // Asegúrate de importar correctamente el modelo

// Obtener todos los usuarios
exports.verUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    return res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  const { email, password, persona_id, rol_id } = req.body;
  if (!email || !password || !persona_id || !rol_id) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const usuario = await Usuario.create({
      email,
      password,
      persona_id,
      rol_id,
    });
    return res.json({
      message: "Usuario creado",
      usuario: { id: usuario.id, email, persona_id, rol_id },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Obtener un usuario por ID
exports.verUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { email, password, persona_id, rol_id } = req.body;
  if (!email || !persona_id || !rol_id) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let hashedPassword = usuario.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await usuario.update({
      email,
      password: hashedPassword,
      persona_id,
      rol_id,
    });
    return res.json({
      message: "Usuario actualizado",
      usuario: { id, email, persona_id, rol_id },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await usuario.destroy();
    return res.json({ message: "Usuario eliminado", id });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
