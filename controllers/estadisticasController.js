const estadisticasEjemplo = require("../data/estadisticasEjemplo");

// Función para generar las fechas dinámicamente
const generarFechas = (cantidad) => {
    const today = new Date();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let fechas = [];

    for (let i = cantidad - 1; i >= 0; i--) {
        let date = new Date(today);
        date.setMonth(today.getMonth() - i);
        fechas.push(`${meses[date.getMonth()]} ${date.getFullYear()}`);
    }

    return fechas;
};

// Función para obtener estadísticas del equipo según el período
const obtenerEstadisticas = (req, res) => {
    const { id } = req.params;
    const { periodo } = req.query; // periodo puede ser '3M', '6M', '1A'

    if (!estadisticasEjemplo[id]) {
        return res.status(404).json({ error: "Equipo no encontrado" });
    }

    let cantidadMeses = 12; // Por defecto, 1 año

    if (periodo === "3M") {
        cantidadMeses = 3;
    } else if (periodo === "6M") {
        cantidadMeses = 6;
    }

    // Obtener las últimas estadísticas según el período seleccionado
    const estadisticasFiltradas = {};
    Object.keys(estadisticasEjemplo[id]).forEach((categoria) => {
        estadisticasFiltradas[categoria] = {};
        Object.keys(estadisticasEjemplo[id][categoria]).forEach((posicion) => {
            estadisticasFiltradas[categoria][posicion] = estadisticasEjemplo[id][categoria][posicion].slice(-cantidadMeses);
        });
    });

    // Generar fechas correspondientes
    const fechas = generarFechas(cantidadMeses);
    
    res.json({ fechas, ...estadisticasFiltradas });
};

module.exports = { obtenerEstadisticas };
