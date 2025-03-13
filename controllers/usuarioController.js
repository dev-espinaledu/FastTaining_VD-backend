const pool = require("../config/db");

// Obtener todos los usuarios
exports.verUsuarios = async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM usuarios");
        return res.json(response.rows);
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
        await pool.query(
            "INSERT INTO usuarios (email, password, persona_id, rol_id) VALUES ($1, $2, $3, $4)",
            [email, password, persona_id, rol_id]
        );
        return res.json({ message: "Usuario creado", usuario: { email, persona_id, rol_id } });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        return res.status(500).json({ error: "Error al crear usuario" });
    }
};

// Obtener un usuario por ID
exports.verUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
        if (response.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        return res.json(response.rows[0]);
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return res.status(500).json({ error: "Error al obtener usuario" });
    }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { email, password, persona_id, rol_id } = req.body;
    if (!email || !password || !persona_id || !rol_id) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        await pool.query(
            "UPDATE usuarios SET email = $1, password = $2, persona_id = $3, rol_id = $4 WHERE id = $5",
            [email, password, persona_id, rol_id, id]
        );
        return res.json({ message: "Usuario actualizado", usuario: { id, email, persona_id, rol_id } });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
        return res.json({ message: "Usuario eliminado", id });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ error: "Error al eliminar usuario" });
    }
};
