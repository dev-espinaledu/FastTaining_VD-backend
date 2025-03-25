const pool = require("../config/db");
const { Persona, Usuario, Jugador, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

// exports.verJugadores = async (req, res) => {
//   try {
//     const response = await Jugador.findAll({
//       include: [
//         {
//           model: Usuario,
//           attributes: ["email"],
//           include: [
//             {
//               model: Persona,
//               attributes: ["nombre", "apellido"],
//             },
//           ],
//         },
//       ],
//     });

//     const jugadores = response.map((jugador) => ({
//       id: jugador.id,
//       nombre: jugador.Usuario.Persona.nombre,
//       apellido: jugador.Usuario.Persona.apellido,
//       email: jugador.Usuario.email,
//       posicion: jugador.posicion,
//       altura: jugador.altura,
//       peso: jugador.peso,
//     }));

//     return res.json(jugadores);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Error al obtener jugadores" });
//   }
// };

exports.verJugadores = async (req, res) => {
  try {
    const response = await Jugador.findAll({
      include: [
        {
          model: Persona, 
          as: "persona",
          attributes: ["nombre", "apellido"],
          include: [
            {
              model: Usuario,
              as: "usuario", 
              attributes: ["email"],
            },
          ],
        },
      ],
    });

    const jugadores = response.map((jugador) => ({
      id: jugador.id,
      nombre: jugador.persona?.nombre || "N/A", 
      apellido: jugador.persona?.apellido || "N/A",
      email: jugador.persona?.usuario?.email || "N/A", 
      posicion: jugador.posicion,
      altura: jugador.altura,
      peso: jugador.peso,
    }));

    return res.json(jugadores);
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return res.status(500).json({ error: "Error al obtener jugadores" });
  }
};



exports.crearJugador = async (req, res) => {
  const {
    nombre,
    apellido,
    telefono,
    email,
    pass,
    equipo_id,
    fecha_nacimiento,
    altura,
    peso,
    posicion,
    porcentaje_grasa_corporal,
    porcentaje_masa_muscular,
    tipo_cuerpo,
    fuerza,
    velocidad_max,
    resistencia_aerobica,
    resistencia_anaerobica,
    flexibilidad,
  } = req.body;
  try {
    const {
      nombre,
      apellido,
      telefono,
      email,
      password,
    } = req.body;
      const persona_id = persona?.id;
      const rol_id = 2;
    const jugador = await Jugador.create({
      usuario_id:usuario.id,
      equipo_id,
      fecha_nacimiento,
      altura,
      peso,
      posicion,
      porcentaje_grasa_corporal,
      porcentaje_masa_muscular,
      tipo_cuerpo,
      fuerza,
      velocidad_max,
      resistencia_aerobica,
      resistencia_anaerobica,
      flexibilidad,
    });

    return res.json({
      message: "Jugador creado exitosamente",
      jugador: {
        id: jugador.id,
        nombre,
        apellido,
        email,
        posicion,
        altura,
        peso,
      },
    });
  } catch (error) {
    await t.rollback(); // Revertir cambios en caso de error
    console.error(error);
    return res.status(500).json({ error: "Error al crear jugador" });
  }
};

exports.verJugador = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await pool.query("SELECT * FROM jugadores WHERE id = $1", [
      id,
    ]);
    if (response.rows.length === 0)
      return res.status(404).json({ error: "Jugador no encontrado" });
    return res.json(response.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener jugador" });
  }
};

exports.actualizarCapacidadJugador = async (req, res) => {
  const { id } = req.params;
  const {
    posicion,
    altura,
    frecuencia_cardiaca,
    peso,
    resistencia,
    fuerza,
    velocidad,
    potencia,
  } = req.body;
  try {
    const jugador = await Jugador.findByPk(id);
    if (!jugador)
      return res.status(404).json({ error: "Jugador no encontrado" });

    return res.json({
      message: "Jugador actualizado",
      jugador: { fecha_nacimiento, posicion, altura },
    });
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
