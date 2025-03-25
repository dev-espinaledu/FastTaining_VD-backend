const express = require("express");
const usuarios = require("./routes/usuarioRoutes");
const jugadores = require("./routes/jugadorRoutes");
const persona = require("./routes/personaRoutes");
const rol = require("./routes/rolRoutes");
const entrenadorRoutes = require("./routes/entrenadorRoutes");

const datosSesion = require("./routes/datosEntrenamientoRoutes");
const entrenamiento = require("./routes/entrenamientoRoutes");


const equipoRoutes = require("./routes/equipoRoutes");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api", usuarios);
app.use("/api", jugadores);
app.use("/api", persona);
app.use("/api", rol);
app.use("/api", entrenadorRoutes);
app.use("/api", equipoRoutes);

app.use("/api", entrenamiento);
app.use("/api", datosSesion);


app.listen(5000, () => {
  console.log("Servidor en puerto 5000");
});
