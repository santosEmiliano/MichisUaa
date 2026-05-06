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

module.exports = {
  getTotalCats,
  getSterilizedCount
};