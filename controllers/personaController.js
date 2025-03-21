const pool = require("../config/db");

exports.verPersonas = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM personas");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener personas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.crearPersona = async (req, res) => {
    const { nombre, apellido, telefono } = req.body;
    if (!nombre || !apellido || !telefono) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const { rows } = await pool.query(
            "INSERT INTO personas (nombre, apellido, telefono) VALUES ($1, $2, $3) RETURNING *",
            [nombre, apellido, telefono]
        );
        res.status(201).json({ message: "Persona creada", persona: rows[0] });
    } catch (error) {
        console.error("Error al crear persona:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.verPersona = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query("SELECT * FROM personas WHERE id = $1", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Persona no encontrada" });

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener persona:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.actualizarPersona = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono } = req.body;
    if (!nombre || !apellido || !telefono) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const { rowCount } = await pool.query(
            "UPDATE personas SET nombre = $1, apellido = $2, telefono = $3 WHERE id = $4",
            [nombre, apellido, edad, id]
        );
        if (rowCount === 0) return res.status(404).json({ error: "Persona no encontrada" });

        res.status(200).json({ message: "Persona actualizada" });
    } catch (error) {
        console.error("Error al actualizar persona:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.eliminarPersona = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query("DELETE FROM personas WHERE id = $1", [id]);
        if (rowCount === 0) return res.status(404).json({ error: "Persona no encontrada" });

        res.status(200).json({ message: "Persona eliminada" });
    } catch (error) {
        console.error("Error al eliminar persona:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};