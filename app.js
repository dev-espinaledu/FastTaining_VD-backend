const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Cargar variables de entorno
const cookieParser = require("cookie-parser");
const jugadores = require("./routes/jugadorRoutes");
const rol = require("./routes/rolRoutes");
const entrenadorRoutes = require("./routes/entrenadorRoutes");
const datosSesion = require("./routes/datosEntrenamientoRoutes");
const entrenamientoRoutes = require("./routes/entrenamientoRoutes");
const equipoRoutes = require("./routes/equipoRoutes");
const authRoutes = require("./routes/authRoutes");
const estadisticasRoutes = require("./routes/estadisticasRoutes");
const app = express();

// Middleware para parsear JSON
app.use(express.json());
// cookie-parser
app.use(cookieParser());

// ✅ Configuración de CORS (solo una vez)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Permitir solo el frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization", "Usuario-Rol"], // Cabeceras permitidas
  }),
);

// ✅ Definir prefijo para las rutas
app.use("/api/auth", authRoutes);
app.use("/api", jugadores);
app.use("/api", rol);
app.use("/api", entrenadorRoutes);
app.use("/api", equipoRoutes);
app.use("/api", entrenamientoRoutes);
app.use("/api", datosSesion);
app.use("/api", estadisticasRoutes);

// ✅ Iniciar servidor en el puerto correcto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} ⚽️`);
});
