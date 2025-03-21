const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Cargar variables de entorno

const usuarios = require("./routes/usuarioRoutes");
const jugadores = require("./routes/jugadorRoutes");
const persona = require("./routes/personaRoutes");
const rol = require("./routes/rolRoutes");
const entrenadorRoutes = require("./routes/entrenadorRoutes");
const equipoRoutes = require("./routes/equipoRoutes");
const calendarioRoutes = require('./routes/calendarioRoutes');
const authRoutes = require("./routes/authRoutes");
const sesionesRoutes = require("./routes/sesionesRoutes");
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  }),
);

// Definir prefijo para las rutas
app.use("/api/auth", authRoutes);
app.use("/api", usuarios);
app.use("/api", jugadores);
app.use("/api", persona);
app.use("/api", rol);
app.use("/api", entrenadorRoutes);
app.use("/api", equipoRoutes);
app.use("/api", calendarioRoutes);


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
