const pool = require("../config/db");

exports.verJugadores = async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM jugadores");
        return res.json(response.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener jugadores" });
    }
};

exports.crearJugador = async (req, res) => {
    const { fecha_nacimiento, posicion, altura } = req.body;
    try {
        await pool.query("INSERT INTO jugadores (fecha_nacimiento, posicion, altura) VALUES ($1, $2, $3)", [fecha_nacimiento, posicion, altura]);
        return res.json({ message: "Jugador creado", jugador: { fecha_nacimiento, posicion, altura } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al crear jugador" });
    }
};

exports.verJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await pool.query("SELECT * FROM jugadores WHERE id = $1", [id]);
        if (response.rows.length === 0) return res.status(404).json({ error: "Jugador no encontrado" });
        return res.json(response.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener jugador" });
    }
};

exports.actualizarJugador = async (req, res) => {
    const { id } = req.params;
    const { fecha_nacimiento, posicion, altura } = req.body;
    try {
        await pool.query("UPDATE jugadores SET fecha_nacimiento = $1, posicion = $2, altura = $3 WHERE id = $4", [fecha_nacimiento, posicion, altura, id]);
        return res.json({ message: "Jugador actualizado", jugador: { id, fecha_nacimiento, posicion, altura } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar jugador" });
    }
};

exports.eliminarJugador = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM jugadores WHERE id = $1", [id]);
        return res.json({ message: "Jugador eliminado", id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar jugador" });
    }
};