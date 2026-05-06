const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const stadisticsFunctions = require("../controllers/stadistics.controller");

// Ruta GET para obtener el total de gatos registrados
router.get(
    "/getTotalCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getTotalCats
)

// Ruta GET para obtener el porcentaje de gatos esterilizados
router.get(
    "/getSterilizedCount",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getSterilizedCount
)

// Ruta GET para obtener el numero de gatos desaparecidos
router.get(
    "/getMissingCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getMissingCats
)

module.exports = router;