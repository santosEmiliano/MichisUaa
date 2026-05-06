const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const stadisticsFunctions = require("../controllers/stadistics.controller");

// Ruta GET para obtener el total de gatos registrados
router.get(
    "/getTotalCats",
    token.verifyToken,
    stadisticsFunctions.getTotalCats
)

// Ruta GET para obtener el porcentaje de gatos esterilizados
router.get(
    "/getSterilizedCount",
    token.verifyToken,
    stadisticsFunctions.getSterilizedCount
)

module.exports = router;