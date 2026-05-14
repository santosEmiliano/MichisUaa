const stadisticsModel = require("../model/stadistics.model");

const getTotalCats = async (req, res) => {
    try {
        const totalCats = await stadisticsModel.getAllCats();
        const addedThisWeek = await stadisticsModel.getCatsAddedThisWeek();
        return res.status(200).json({ total: totalCats, addedThisWeek: addedThisWeek });
    } catch (error) {
        console.error("Error al obtener total de gatos:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const getSterilizedCount = async (req, res) => {
    try {
        const totalCats = await stadisticsModel.getAllCats();
        const sterilizedCount = await stadisticsModel.getSterilizedCount();
        const percentage = totalCats > 0 ? Math.round((sterilizedCount / totalCats) * 100) : 0;

        const totalCatsLastWeek = await stadisticsModel.getAllCatsLastWeek();
        const sterilizedLastWeek = await stadisticsModel.getSterilizedCountLastWeek();
        const percentageLastWeek = totalCatsLastWeek > 0 ? Math.round((sterilizedLastWeek / totalCatsLastWeek) * 100) : 0;

        const trendPercentage = percentage - percentageLastWeek;

        return res.status(200).json({
            count: sterilizedCount,
            total: totalCats,
            percentage: percentage,
            trendPercentage: trendPercentage
        });
    } catch (error) {
        console.error("Error al obtener porcentaje de gatos esterilizados:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const getMissingCats = async (req, res) => {
    try {
        const missingCatsCount = await stadisticsModel.getMissingCatsCount(); 
        const missingAddedThisWeek = await stadisticsModel.getMissingCatsAddedThisWeek();
        return res.status(200).json({ total: missingCatsCount, addedThisWeek: missingAddedThisWeek });
    } catch (error) {
        console.error("Error al obtener porcentaje de gatos esterilizados:", error);
        return res.status(500).json({ mensaje: "Error al obtener el total de gatos" });
    }
}

const sightingsLastWeek = async (req, res) => {
    try {
        const fecha7Dias = new Date(); // Fecha actual en UTC (Horario universal)
        fecha7Dias.setDate(fecha7Dias.getDate() - 7);
        
        const fecha14Dias = new Date();
        fecha14Dias.setDate(fecha14Dias.getDate() - 14);
        
        const sightingsCount = await stadisticsModel.getSightingsLastWeekCount(fecha7Dias);
        const previousWeekCount = await stadisticsModel.getSightingsPreviousWeekCount(fecha7Dias, fecha14Dias);
        
        const trend = sightingsCount - previousWeekCount;
        
        return res.status(200).json({ count: sightingsCount, trend });
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

const sighingsTendency = async (req, res) => {
    try {
        const tendencia = await stadisticsModel.getSightingsTendency();
        return res.status(200).json(tendencia);
    } catch (error) {
        console.error("Error al obtener tendencia de avistamientos:", error);
        return res.status(500).json({ mensaje: "Error al obtener tendencia de avistamientos" });
    }
}

const sterilizedState = async (req, res) => {
    try {
        const estado = await stadisticsModel.getSterilizedState();
        return res.status(200).json(estado);
    } catch (error) {
        console.error("Error al obtener estado de esterilización:", error);
        return res.status(500).json({ mensaje: "Error al obtener estado de esterilización" });
    }
}

module.exports = {
  getTotalCats,
  getSterilizedCount,
  getMissingCats,
  sightingsLastWeek,
  signingsPerColony,
  coloniesSummary,
  sighingsTendency,
  sterilizedState
};