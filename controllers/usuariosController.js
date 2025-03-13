const pool = require("../config/db");

const verUsuarios = async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM usuarios");
        res.json(response.rows);
    } catch (error) {
        console.log(error);
    }
}

const crearUsuario = async (req, res) => {
    const { nombre, apellido, edad } = req.body;
    try {
        const response = await pool.query("INSERT INTO usuarios (nombre, apellido, edad) VALUES ($1, $2, $3)", [nombre, apellido, edad]);
        res.json({
            message: "Usuario creado",
            body: {
                usuario: { nombre, apellido, edad }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

