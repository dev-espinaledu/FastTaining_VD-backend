
const {DatoSesion, Entrenamiento, Jugador} = require("../models");
/* const Openai = require("../api/openia");
const axios = require("axios");
 */
require("dotenv").config();

const generarEntrenamientoIndividual = async (req, res) => {
  const { id } = req.params;

  try {
    const sesion = await DatoSesion.findByPk(id, {
      include: [{ model: Jugador, as: "jugadores" }],
    });

    if (!sesion) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const jugador = sesion.jugadores;
    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado en la sesión" });
    }

    console.log("API Key:", process.env.OPENROUTE_API_KEY);

    // Construcción del mensaje para la IA
    const mensajeIA = {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Eres un experto en entrenamiento de fútbol." },
        {
          role: "user",
          content: `Genera una sesión de entrenamiento para un jugador con objetivo ${sesion.objetivo} y estas características:
          - Fecha de nacimiento: ${jugador.fechaNacimiento}
          - Altura: ${jugador.altura} cm
          - Peso: ${jugador.peso} kg
          - Posición: ${jugador.posicion}
          - Grasa corporal: ${jugador.porcentaje_grasa_corporal}%
          - Masa muscular: ${jugador.porcentaje_masa_muscular}%
          - Tipo de cuerpo: ${jugador.tipo_cuerpo}
          - Fuerza: ${jugador.fuerza}
          - Velocidad máxima (30m): ${jugador.velocidad} s
          - Resistencia: ${jugador.resistencia} ml/kg/min
          - Resistencia aerobica: ${jugador.resistencia_aerobica} ml/kg/min
          - Resistencia anaerobica (300m): ${jugador.resistencia_anaerobica} s
          - Flexibilidad: ${jugador.flexibilidad} cm

          Devuelve un entrenamiento estructurado en tres fases:
          1. **Fase Inicial**: Ejercicios de calentamiento.
          2. **Fase Central**: Ejercicios específicos de fútbol.
          3. **Fase Final**: Ejercicios de enfriamiento.

          Responde en formato JSON con esta estructura:
          {
            "fase_inicial": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}],
            "fase_central": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}],
            "fase_final": [{"ejercicio": "nombre", "repeticiones": X, "series": Y}]
          }`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    // Llamada a la API de OpenRouter
    const respuestaIA = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTE_API_KEY}`,
      },
      body: JSON.stringify(mensajeIA),
    });

    const data = await respuestaIA.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.log("Respuesta de la IA:", data);
      return res.status(500).json({ error: "Respuesta vacía o inválida de la IA" });
    }

    let contenidoIA = data.choices[0].message.content;
    console.log("Contenido recibido de la IA:", contenidoIA);

    // Quitar código Markdown si está presente
    if (contenidoIA.startsWith("```json")) {
      contenidoIA = contenidoIA.slice(7, -3).trim();
    } else if (contenidoIA.startsWith("```")) {
      contenidoIA = contenidoIA.slice(3, -3).trim();
    }

    // Validar JSON antes de parsearlo
    try {
      entrenamiento = JSON.parse(contenidoIA);
    } catch (error) {
      console.error("Error al parsear JSON de la IA:", error, "Contenido recibido:", contenidoIA);
      return res.status(500).json({ error: "Formato inválido en la respuesta de la IA" });
    }

    // Verificar estructura de entrenamiento
    if (!entrenamiento.fase_inicial || !entrenamiento.fase_central || !entrenamiento.fase_final) {
      return res.status(500).json({ error: "Estructura inválida en la respuesta de la IA" });
    }

    // Guardar en la base de datos
    const nuevoEntrenamiento = await Entrenamiento.create({
      datos_sesion_id: sesion.id,
      
      fase_inicial: JSON.stringify(entrenamiento.fase_inicial),
      fase_central: JSON.stringify(entrenamiento.fase_central),
      fase_final: JSON.stringify(entrenamiento.fase_final),
    });

    console.log("Entrenamiento creado con éxito");
    return res.status(201).json(nuevoEntrenamiento);
  } catch (error) {
    console.error("Error generando entrenamiento:", error);
    return res.status(500).json({ error: "Error generando entrenamiento" });
  }
};

const verEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el entrenamiento en la base de datos
    const entrenamiento = await DatoSesion.findByPk(id, {
      include: [{ model: Entrenamiento, as: "entrenamiento" }],
    });

    if (!entrenamiento) {
      return res.status(404).json({ error: "Entrenamiento no encontrado" });
    }

    const datos = entrenamiento.entrenamiento;

    // Verificar si las fases existen antes de parsear
    const formatoEntrenamiento = {
      fase_inicial: entrenamiento.fase_inicial ? JSON.parse(entrenamiento.fase_inicial) : [],
      fase_central: entrenamiento.fase_central ? JSON.parse(entrenamiento.fase_central) : [],
      fase_final: entrenamiento.fase_final ? JSON.parse(entrenamiento.fase_final) : [],
    };

    //No es necesario hacer JSON.parse(entrenamiento)
    console.log("Entrenamiento encontrado:", entrenamiento);

    // Convertir la estructura en un formato más legible
    const entrenamientoFormateado = Object.entries(formatoEntrenamiento).map(([fase, ejercicios]) => ({
      titulo: fase.replace("_", " ").toUpperCase(),
      ejercicios: ejercicios.map(ejercicio => ({
        fecha: datos.fecha,
        objetivo: datos.objetivo,
        posicion: datos.posicion, // Asegurar que la propiedad existe
        nombre: ejercicio.nombre,
      })),
    }));

    res.json({ entrenamiento: entrenamientoFormateado });

  } catch (error) {
    console.error("Error obteniendo el entrenamiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


module.exports = { generarEntrenamientoIndividual, verEntrenamiento };

