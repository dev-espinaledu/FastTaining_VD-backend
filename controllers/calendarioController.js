const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'entrenamientos.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Asegurar que el directorio de datos existe
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error al crear directorio de datos:', err);
  }
}

// Cargar datos iniciales
async function loadInitialData() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // El archivo no existe, crear datos iniciales
    const initialData = {
      entrenamientoActual: {
        posicion: "Delanteros",
        fecha: "2024-03-20",
        objetivo: "Mejorar resistencia",
        fases: [
          { nombre: "Calentamiento", ejercicios: "Juego predeportivo con pelota.", duracion: "15 min" },
          { nombre: "Parte Central", ejercicios: "Circuito con jumping jacks, burpees, sentadillas, flexiones y planchas.", duracion: "15 min" },
          { nombre: "Enfriamiento", ejercicios: "Estiramientos en diferentes posiciones.", duracion: "5 min" },
        ],
      },
      historialEntrenamientos: []
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Archivo de datos iniciales creado');
  }
}

// Inicializar datos
(async () => {
  await ensureDataDirectory();
  await loadInitialData();
})();

// Rutas API

// GET - Obtener entrenamiento actual
app.get('/api/entrenamientos/actual', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    res.json(parsedData.entrenamientoActual);
  } catch (error) {
    console.error('Error al leer el entrenamiento actual:', error);
    res.status(500).json({ 
      error: 'Error al cargar los datos del entrenamiento',
      message: error.message 
    });
  }
});

// PUT - Actualizar entrenamiento actual
app.put('/api/entrenamientos/actual', async (req, res) => {
  try {
    const nuevoEntrenamiento = req.body;
    
    // Validar datos recibidos
    if (!nuevoEntrenamiento || !nuevoEntrenamiento.posicion || !nuevoEntrenamiento.fecha || !nuevoEntrenamiento.objetivo) {
      return res.status(400).json({ error: 'Datos de entrenamiento incompletos' });
    }
    
    // Leer datos actuales
    const dataStr = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(dataStr);
    
    // Guardar el entrenamiento actual en el historial si es diferente
    if (JSON.stringify(data.entrenamientoActual) !== JSON.stringify(nuevoEntrenamiento)) {
      // Añadir timestamp para el historial
      const entrenamientoHistorico = {
        ...data.entrenamientoActual,
        guardadoEn: new Date().toISOString()
      };
      
      data.historialEntrenamientos.push(entrenamientoHistorico);
    }
    
    // Actualizar entrenamiento actual
    data.entrenamientoActual = nuevoEntrenamiento;
    
    // Guardar datos actualizados
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Entrenamiento actualizado correctamente' 
    });
  } catch (error) {
    console.error('Error al actualizar el entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al guardar los datos del entrenamiento',
      message: error.message 
    });
  }
});

// Ruta adicional para obtener historial (opcional)
app.get('/api/entrenamientos/historial', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    res.json(parsedData.historialEntrenamientos);
  } catch (error) {
    console.error('Error al leer el historial de entrenamientos:', error);
    res.status(500).json({ 
      error: 'Error al cargar el historial',
      message: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend funcionando en puerto ${PORT}`);
});