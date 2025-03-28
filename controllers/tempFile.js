const { Entrenamiento, Jugador } = require("../models");
const openai = require("openai");

const generarEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {
    const jugador = await Jugador.findByPk(id);
    if (!jugador) {
      return res.status(404).json({ error: "Es " });
    }

    //Consulta IA
    const consultaOpenai = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un experto en entrenamiento de fútbol.",
        },
        {
          role: "user",
          content: `Genera una sesión de entrenamiento para un jugador con estas características:
          - Fecha de nacimiento: ${jugador.fechaNacimiento}
          - Posición: ${jugador.posicion}
          - Altura: ${jugador.altura} cm
          - Peso: ${jugador.peso} kg
          - Frecuencia cardiaca: ${jugador.frecuenciaCardiaca} bpm
          - VO2 máx.: ${jugador.resistencia} ml/kg/min
          - Velocidad (30m): ${jugador.velocidad} s
          - Salto vertical: ${jugador.fuerza} cm
          - Potencia relativa: ${jugador.potencia} W/kg
          - Objetivo del entrenamiento: ${jugador.objetivo}

          Devuelve un entrenamiento estructurado en tres fases:
          1. *Fase Inicial*: Ejercicios de calentamiento.
          2. *Fase Central*: Ejercicios específicos de fútbol.
          3. *Fase Final*: Ejercicios de enfriamiento.

          Responde en formato JSON con esta estructura:
          {
            "fase_inicial": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"],
            "fase_central": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"],
            "fase_final": ["ejercicio1", "ejercicio2","ejercicio n","repeticiones","series"]
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    //Formato JSON
    const entrenamiento = JSON.parse(consultaOpenai.choices[0].message.content);

    // Base de datos
    const nuevoEntrenamiento = await Entrenamiento.create({
      jugador_id: jugador.id,
      fase_inicial: entrenamiento.fase_inicial,
      fase_central: entrenamiento.fase_central,
      fase_final: entrenamiento.fase_final,
    });

    //REspuesta
    console.log("Enrtrenamiento Creado y guardado correctamentee");
    return res.status(201).json(nuevoEntrenamiento);
  } catch (error) {
    console.error("Error generando entrenamiento:", error);
    return res.status(500).json({ error: "Error generando entrenamiento" });
  }
};

module.exports = { generarEntrenamiento };
