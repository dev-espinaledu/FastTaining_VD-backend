const pool = require("../config/db");
const { Rol } = require("../models");

exports.verRoles = async (req, res) => {
  try {
    const listaRoles = await Rol.findAll();
    res.status(200).json(listaRoles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.crearRol = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const nuevoRol = await Rol.create({ nombre });
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.verRol = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM roles WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Rol no encontrado" });

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const { rowCount } = await pool.query(
      "UPDATE roles SET nombre = $1 WHERE id = $2",
      [nombre, id],
    );
    if (rowCount === 0)
      return res.status(404).json({ error: "Rol no encontrado" });

    res.status(200).json({ message: "Rol actualizado" });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.eliminarRol = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM roles WHERE id = $1", [
      id,
    ]);
    if (rowCount === 0)
      return res.status(404).json({ error: "Rol no encontrado" });

    res.status(200).json({ message: "Rol eliminado" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
