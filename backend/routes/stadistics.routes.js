const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const stadisticsFunctions = require("../controllers/stadistics.controller");

// Ruta GET para obtener el total de gatos registrados
router.get(
    "/totalCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getTotalCats
)

// Ruta GET para obtener el porcentaje de gatos esterilizados
router.get(
    "/sterilizedCount",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getSterilizedCount
)

// Ruta GET para obtener el numero de gatos desaparecidos
router.get(
    "/missingCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getMissingCats
)

// Ruta GET para obtener el total de avistamientos en la ultima semana
router.get(
    "/sightingsLastWeek",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.sightingsLastWeek
)

// Ruta GET para obtener el total de avistamientos en la ultima semana
router.get(
    "/signingsPerColony",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.signingsPerColony
)

module.exports = router;