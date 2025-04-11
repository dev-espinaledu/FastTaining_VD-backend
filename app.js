const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, "public/uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Usuario-Rol"],
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);

// Middleware para archivos estáticos
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"), {
    setHeaders: (res) => {
      res.set("Cache-Control", "public, max-age=86400"); // 1 día
    },
  })
);

// Preflight para todas las rutas
app.options("*", cors());

// Rutas API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/jugadorRoutes"));
app.use("/api", require("./routes/rolRoutes"));
app.use("/api", require("./routes/entrenadorRoutes"));
app.use("/api", require("./routes/equipoRoutes"));
app.use("/api", require("./routes/entrenamientoRoutes"));
app.use("/api", require("./routes/datosEntrenamientoRoutes"));
app.use("/api", require("./routes/estadisticasRoutes"));
app.use("/api", require("./routes/usuarioRoutes"));
app.use("/api", require("./routes/personaRoutes"));

// Error 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error interno:", err.stack);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
});

// Inicializar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});