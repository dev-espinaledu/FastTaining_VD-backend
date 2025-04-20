const { DatoSesion, Entrenamiento, Equipo, Jugador } = require("../models");
require("dotenv").config();

const generarEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {
    const sesion = await DatoSesion.findByPk(id, {
      include: [{ model: Equipo, as: "datos_sesions" }],
    });

    if (!sesion) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    console.log("API Key:", process.env.OPENROUTE_API_KEY);

    const equipo = sesion.datos_sesions;
    if (!equipo) {
      return res
        .status(404)
        .json({ error: "Equipo no encontrado en la sesión" });
    }

    console.log("API Key:", process.env.OPENROUTE_API_KEY);

    // Construcción del mensaje para la IA
    const mensajeIA = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un experto en entrenamiento de fútbol.",
        },
        {
          role: "user",
          content: `Genera una sesión de entrenamiento para un jugador con objetivo ${sesion.objetivo}teniendo en cuenta estas características:
          - Categoria: ${equipo.categoria}
          - Altura: ${sesion.altura} cm
          - Peso: ${sesion.peso} kg
          - Posición en la cancha: ${sesion.posicion}
          - Grasa corporal: ${sesion.porcentaje_grasa_corporal}%
          - Masa muscular: ${sesion.porcentaje_masa_muscular}%
          - Potencia muscular en piernas: ${sesion.potencia_mucular_piernas}
          - Velocidad máxima (30m): ${sesion.velocidad} s
          - Resistencia: ${sesion.resistencia} ml/kg/min
          - Resistencia aeróbica: ${sesion.resistencia_aerobica} ml/kg/min
          - Resistencia anaeróbica (300m): ${sesion.resistencia_anaerobica} s
          - Flexibilidad: ${sesion.flexibilidad} cm

          Devuelve un entrenamiento estructurado en tres fases:
          1. *Fase Inicial*: Ejercicios de calentamiento.
          2. *Fase Central*: Ejercicios específicos de fútbol.
          3. *Fase Final*: Ejercicios de enfriamiento.

          Responde en formato JSON con esta estructura:
          {
            "fase_inicial": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}],
            "fase_central": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}],
            "fase_final": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}]
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    };

    // Llamada a la API de OpenRouter
    const respuestaIA = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTE_API_KEY}`,
        },
        body: JSON.stringify(mensajeIA),
      },
    );

    const data = await respuestaIA.json();

    if (
      !data.choices ||
      data.choices.length === 0 ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      console.log("Respuesta de la IA:", data);
      return res
        .status(500)
        .json({ error: "Respuesta vacía o inválida de la IA" });
    }

    let contenidoIA = data.choices[0].message.content;
    console.log("Contenido recibido de la IA:", contenidoIA);

    // Extraer solo el JSON válido
    const jsonMatch = contenidoIA.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error(
        "No se encontró JSON válido en la respuesta de la IA:",
        contenidoIA,
      );
      return res
        .status(500)
        .json({ error: "Formato inválido en la respuesta de la IA" });
    }

    let entrenamiento;
    try {
      entrenamiento = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(
        "Error al parsear JSON de la IA:",
        error,
        "Contenido recibido:",
        jsonMatch[0],
      );
      return res
        .status(500)
        .json({ error: "Formato inválido en la respuesta de la IA" });
    }

    // Verificar estructura de entrenamiento
    if (
      !entrenamiento.fase_inicial ||
      !entrenamiento.fase_central ||
      !entrenamiento.fase_final
    ) {
      return res
        .status(500)
        .json({ error: "Estructura inválida en la respuesta de la IA" });
    }

    // Guardar en la base de datos (si las columnas son JSONB, no es necesario JSON.stringify)
    const nuevoEntrenamiento = await Entrenamiento.create({
      datos_sesion_id: sesion.id,
      fase_inicial: entrenamiento.fase_inicial,
      fase_central: entrenamiento.fase_central,
      fase_final: entrenamiento.fase_final,
    });

    console.log("Entrenamiento creado con éxito");
    return res.status(201).json(nuevoEntrenamiento);
  } catch (error) {
    console.error("Error generando entrenamiento:", error);
    return res.status(500).json({ error: "Error generando entrenamiento" });
  }
};

//-------------------------------------

const verEntrenamientoIndividual = async (req, res) => {
  try {
    const { id } = req.params;

    const entrenamiento = await Entrenamiento.findByPk(id, {
      include: [
        {
          model: DatoSesion,
          as: "datosSesion",
          attributes: ["fecha", "objetivo"],
        },
      ],
    });

    if (!entrenamiento) {
      return res.status(404).json({ error: "Entrenamiento no encontrado" });
    }

    const datos = entrenamiento.datosSesion;

    console.log("Datos del entrenamiento:", datos);

    // Verificar si las fases existen antes de parsear
    const formatoEntrenamiento = {
      fase_inicial: entrenamiento.fase_inicial
        ? JSON.parse(entrenamiento.fase_inicial)
        : [],
      fase_central: entrenamiento.fase_central
        ? JSON.parse(entrenamiento.fase_central)
        : [],
      fase_final: entrenamiento.fase_final
        ? JSON.parse(entrenamiento.fase_final)
        : [],
    };

    console.log("Fases del entrenamiento:", formatoEntrenamiento);

    // Convertir la estructura en un formato más legible
    const entrenamientoFormateado = Object.entries(formatoEntrenamiento).map(
      ([fase, ejercicios]) => ({
        titulo: fase.replace("_", " ").toUpperCase(),
        ejercicios:
          Array.isArray(ejercicios) && ejercicios.length > 0
            ? ejercicios.map((ejercicio) => ({
                fecha: datos?.fecha || "Fecha no disponible",
                objetivo: datos?.objetivo || "Objetivo no disponible",
                nombre: ejercicio?.nombre || "Ejercicio sin nombre",
              }))
            : [{ mensaje: "No hay ejercicios en esta fase" }], // Mensaje si la fase está vacía
      }),
    );

    res.json({ entrenamiento: entrenamientoFormateado });
  } catch (error) {
    console.error("Error obteniendo el entrenamiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//-----------------------------------------------

const verEntrenamientos = async (req, res) => {
  try {
    console.log("Está accediendo a la funcionalidad de VerEntrenamiento");
    const entrenamientos = await Entrenamiento.findAll({
      include: [
        {
          model: DatoSesion,
          as: "datosSesion",
          attributes: ["fecha", "objetivo"],
        },
      ],
    });

    if (entrenamientos.length === 0) {
      return res
        .status(404)
        .json({ error: "No hay entrenamientos disponibles" });
    }

    console.log("2");

    const entrenamientosFormateados = entrenamientos.map((entrenamiento) => {
      const datos = entrenamiento.datosSesion;

      return {
        fecha: datos.fecha || "Fecha no disponible",
        objetivo: datos.objetivo || "Objetivo no disponible",
        fase_inicial: entrenamiento.fase_inicial || [],
        fase_central: entrenamiento.fase_central || [],
        fase_final: entrenamiento.fase_final || [],
      };
    });
    console.log("3");

    res.json(entrenamientosFormateados);
    console.log("4");
    console.log(entrenamientosFormateados);
  } catch (error) {
    console.error("Error obteniendo los entrenamientos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtiene todos los entrenamientos de un jugador
const obtenerEntrenamientosPorJugador = async (req, res) => {
  const { id } = req.params;

  try {
    // Primero obtenemos la posición del jugador
    const jugador = await Jugador.findByPk(id, {
      attributes: ["posicion"],
    });

    if (!jugador) {
      return res.status(404).json({
        mensaje: "Jugador no encontrado",
      });
    }

    // Buscamos entrenamientos por posición
    const entrenamientos = await Entrenamiento.findAll({
      include: [
        {
          model: DatoSesion,
          as: "datosSesion",
          where: {
            posicion: jugador.posicion,
          },
          attributes: ["fecha", "objetivo"],
        },
      ],
    });

    if (entrenamientos.length === 0) {
      return res.status(200).json({
        mensaje: `No se encontraron entrenamientos para la posición ${jugador.posicion}`,
      });
    }

    const entrenamientosFormateados = entrenamientos.map((entrenamiento) => {
      const datos = entrenamiento.datosSesion;
      return {
        id: entrenamiento.id,
        fecha: datos.fecha || "Fecha no disponible",
        objetivo: datos.objetivo || "Objetivo no disponible",
        posicion: jugador.posicion,
        fase_inicial:
          typeof entrenamiento.fase_inicial === "string"
            ? JSON.parse(entrenamiento.fase_inicial)
            : entrenamiento.fase_inicial || [],
        fase_central:
          typeof entrenamiento.fase_central === "string"
            ? JSON.parse(entrenamiento.fase_central)
            : entrenamiento.fase_central || [],
        fase_final:
          typeof entrenamiento.fase_final === "string"
            ? JSON.parse(entrenamiento.fase_final)
            : entrenamiento.fase_final || [],
      };
    });

    res.json(entrenamientosFormateados);
  } catch (error) {
    console.error("Error al obtener entrenamientos:", error);
    res.status(500).json({
      error: "Error al obtener los entrenamientos",
      detalles: error.message,
    });
  }
};

// Obtener todos los entrenamientos hechos por un jugador

module.exports = {
  generarEntrenamiento,
  verEntrenamientos,
  verEntrenamientoIndividual,
  obtenerEntrenamientosPorJugador,
};