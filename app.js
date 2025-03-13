const express = require("express");
const usuarios = require("./routes/usuariosRoutes");

const app = express();
app.use(express.json());

app.use("/usuarios", usuarios);

app.listen(4000, () => {
    console.log("Servidor en puerto 4000");
});
