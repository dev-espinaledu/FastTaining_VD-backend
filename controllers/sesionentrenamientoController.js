const {DatoSesion, Entrenamiento, Jugador} = require("../models");
const openai = require("openai");

const generarEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {


    const sesion = await DatoSesion.findByPk(id,{include:{
        Jugador, as: "Jugadores"
    }});


    //Consulta IA
    const mensajeIA = (jugador) =>{
         return `Genera una sesión de entrenamiento para un jugador con estas características:
          - Fecha de nacimiento: ${jugador.fechaNacimiento}
          - Altura: ${jugador.altura} cm
          - Peso: ${jugador.peso} kg
          - Posición: ${jugador.posicion}
          - Grasa corporal: ${jugador.porcentaje_grasa_corporal}
          - Grasa muscular: ${jugador.porcentaje_grasa_muscular}
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
    
    const jugador = sesion.Jugador;

    const respuestaIA = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Eres un experto en entrenamiento de fútbol." },
          { role: "user", content: mensajeIA(jugador) },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });


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

module.exports = {generarEntrenamiento};
