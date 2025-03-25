
const {DatoSesion, Entrenamiento, Jugador} = require("../models");
/* const Openai = require("../api/openia");
const axios = require("axios");
 */

require("dotenv").config();

const generarEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {
    const sesion = await DatoSesion.findByPk(id, {
      include: [{ model: Jugador, as: "Jugadores" }],
    });

    if (!sesion) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const jugador = sesion.Jugadores;
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
          - Resistencia anaerobica: ${jugador.resistencia_anaerobica} ml/kg/min
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
      id_datos_sesion: sesion.id,
      
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

module.exports = { generarEntrenamiento };

/* 
const generarEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {


    const sesion = await DatoSesion.findByPk(id,
      {include:[{model: Jugador, as: "Jugadores"}]}
    );


    //Consulta IA
    const mensajeIA = (jugador) =>{
         return `Genera una sesión de entrenamiento para un jugador enfocado en el objetivo de entrenamiento ${sesion.objetivo} con estas características:
          - Fecha de nacimiento: ${jugador.fechaNacimiento}
          - Altura: ${jugador.altura} cm
          - Peso: ${jugador.peso} kg
          - Posición: ${jugador.posicion}
          - Grasa corporal: ${jugador.porcentaje_grasa_corporal}
          - Grasa muscular: ${jugador.porcentaje_masa_muscular}
          - Tipo de cuerpo: ${jugador.tipo_cuerpo}
          - Fuerza: ${jugador.fuerza}
          - Velocidad máxima(30m): ${jugador.velocidad} s
          - resistencia:${jugador.resistencia}  ml/kg/min
          - resistencia cardiovascular:${jugador.resistencia_cardiovascular}  ml/kg/min
          - resistencia muscular:${jugador.resistencia_muscular}  ml/kg/min
          - flexibilidad:${jugador.flexibilidad} cm
          Devuelve un entrenamiento estructurado en tres fases:
          1. **Fase Inicial**: Ejercicios de calentamiento.
          2. **Fase Central**: Ejercicios específicos de fútbol.
          3. **Fase Final**: Ejercicios de enfriamiento.

          Responde en formato JSON con esta estructura:
          {
            "fase_inicial": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"],
            "fase_central": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"],
            "fase_final": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"]
          }`;
        };
    
    const jugador = sesion.Jugadores;

    const respuestaIA = await Openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Eres un experto en entrenamiento de fútbol." },
          { role: "user", content: mensajeIA(jugador) },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      if (!respuestaIA.choices || respuestaIA.choices.length === 0) {
        return res.status(500).json({ error: "Error en la respuesta de OpenAI" });
      }


    //Formato JSON
    const entrenamiento = JSON.parse(respuestaIA.choices[0].message.content);

    // Base de datos
    const nuevoEntrenamiento = await Entrenamiento.create({
      id_jugador: jugador.id, 
      fase_inicial: JSON.stringify(entrenamiento.fase_inicial),
      fase_central: JSON.stringify(entrenamiento.fase_central),
      fase_final: JSON.stringify(entrenamiento.fase_final),
      id_datos_sesion: sesion.id
    });

    //REspuesta
    console.log("Enrtrenamiento Creado y guardado correctamentee")
    return res.status(201).json(nuevoEntrenamiento);
  } catch (error) {
    console.error("Error generando entrenamiento:", error);
    return res.status(500).json({ error: "Error generando entrenamiento" });
  }
};

 */
