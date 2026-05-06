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

module.exports = {
  getTotalCats
};