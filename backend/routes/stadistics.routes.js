const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const stadisticsFunctions = require("../controllers/stadistics.controller");

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Endpoints analíticos utilizados exclusivamente para poblar los gráficos del panel de administración web
 */

/**
 * @swagger
 * /api/stadistics/totalCats:
 *   get:
 *     summary: Conteo global de gatos (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve el número total de gatos en el sistema (ej. 38)
 */
router.get(
    "/totalCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getTotalCats
)

/**
 * @swagger
 * /api/stadistics/sterilizedCount:
 *   get:
 *     summary: Porcentaje y conteo de gatos esterilizados (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve el porcentaje global (ej. 68%) y la proporción de gatos esterilizados
 */
router.get(
    "/sterilizedCount",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getSterilizedCount
)

/**
 * @swagger
 * /api/stadistics/missingCats:
 *   get:
 *     summary: Indicador de gatos desaparecidos (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Número de gatos cuyo estado actual es "Desaparecido"
 */
router.get(
    "/missingCats",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.getMissingCats
)

/**
 * @swagger
 * /api/stadistics/sightingsLastWeek:
 *   get:
 *     summary: Reportes semanales de avistamientos (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de avistamientos recibidos en los últimos 7 días
 */
router.get(
    "/sightingsLastWeek",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.sightingsLastWeek
)

/**
 * @swagger
 * /api/stadistics/signingsPerColony:
 *   get:
 *     summary: Distribución de avistamientos por colonia (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo clave-valor con nombres de colonia y cantidades de avistamientos (útil para gráficas de barras)
 */
router.get(
    "/signingsPerColony",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.signingsPerColony
)

/**
 * @swagger
 * /api/stadistics/coloniesSummary:
 *   get:
 *     summary: Resumen demográfico de gatos por colonia (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tabla de resumen detallando el total de gatos y esterilizados agrupados por cada zona/colonia
 */
router.get(
    "/coloniesSummary",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.coloniesSummary
)

/**
 * @swagger
 * /api/stadistics/sighingsTendency:
 *   get:
 *     summary: Tendencia de avistamientos en el tiempo (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Puntos de datos temporales (fechas y conteos) para renderizar gráficas de línea/tendencia
 */
router.get(
    "/sighingsTendency",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.sighingsTendency
)

/**
 * @swagger
 * /api/stadistics/sterilizedState:
 *   get:
 *     summary: Distribución de estados reproductivos (Solo Admin)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo de estados (Esterilizado, No Esterilizado, Desconocido) para renderizar gráficas de pastel (Pie Chart)
 */
router.get(
    "/sterilizedState",
    token.verifyToken,
    token.verifyAdmin,
    stadisticsFunctions.sterilizedState
)

module.exports = router;