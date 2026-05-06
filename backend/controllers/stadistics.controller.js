const stadisticsModel = require("../model/stadistics.model");

const getTotalCats = async (req, res) => {
    try {
        const totalCats = await stadisticsModel.getAllCats();
        return res.status(200).json(totalCats);
    } catch (error) {
        console.error("Error al obtener total de gatos:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const getSterilizedCount = async (req, res) => {
    try {
        const totalCats = await stadisticsModel.getAllCats();
        const sterilizedCount = await stadisticsModel.getSterilizedCount();
        const percentage = (sterilizedCount / totalCats) * 100;
        return res.status(200).json(Math.round(percentage));
    } catch (error) {
        console.error("Error al obtener porcentaje de gatos esterilizados:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const getMissingCats = async (req, res) => {
    try {
        const missingCatsCount = await stadisticsModel.getMissingCatsCount(); 
        return res.status(200).json(missingCatsCount);
    } catch (error) {
        console.error("Error al obtener porcentaje de gatos esterilizados:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const sightingsLastWeek = async (req, res) => {
    try {
        const fecha = new Date(); // Fecha actual en UTC (Horario universal)
        fecha.setDate(fecha.getDate() - 7);
        
        const sightingsCount = await stadisticsModel.getSightingsLastWeekCount(fecha);
        return res.status(200).json(sightingsCount);
    } catch (error) {
        console.error("Error al obtener avistamientos de la última semana:", error);
        return res.status(500).json({ mensaje: "Error al obtener avistamientos" });
    }
}

const signingsPerColony = async (req, res) => {
    try {
        const avistamientosColonias = await stadisticsModel.getSigningsPerColony();
        return res.status(200).json(avistamientosColonias);
    } catch (error) {
        console.error("Error al obtener avistamientos de la última semana:", error);
        return res.status(500).json({ mensaje: "Error al obtener avistamientos" });
    }
}

const coloniesSummary = async (req, res) => {
    try {
        const coloniasResumen = await stadisticsModel.getColoniesSummary();
        return res.status(200).json(coloniasResumen);
    } catch (error) {
        console.error("Error al obtener resumen de colonias:", error);
        return res.status(500).json({ mensaje: "Error al obtener resumen de colonias" });
    }
}

module.exports = {
  getTotalCats,
  getSterilizedCount,
  getMissingCats,
  sightingsLastWeek,
  signingsPerColony,
  coloniesSummary
};