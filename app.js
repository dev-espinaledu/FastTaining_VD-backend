const express = require("express");
const usuarios = require("./routes/usuarioRoutes");
const jugadores = require("./routes/jugadorRoutes");
const persona = require("./routes/personaRoutes");
const rol = require("./routes/rolRoutes");

const app = express();
app.use(express.json());

app.use("/api", usuarios);
app.use("/api", jugadores);
app.use("/api", persona);
app.use("/api", rol);

app.listen(4000, () => {
    console.log("Servidor en puerto 4000");
});
