const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const multer = require("../middleware/multer");
const sightingFunctions = require("../controllers/sightings.controller");

const upload = multer("sightings");

/**
 * @swagger
 * tags:
 *   name: Avistamientos
 *   description: Sistema de reportes de gatos y ranking de usuarios de la comunidad
 */

/**
 * @swagger
 * /api/avistamientos:
 *   get:
 *     summary: Obtener el listado de avistamientos registrados
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idUsuario
 *         description: Filtrar avistamientos realizados por un usuario específico (opcional)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de avistamientos (pendientes, aprobados o rechazados)
 */
router.get("/", token.verifyToken, sightingFunctions.readSightings);

/**
 * @swagger
 * /api/avistamientos/ranking:
 *   get:
 *     summary: Obtener el Top 20 de usuarios (Ranking General)
 *     description: Lista a los usuarios con mayor cantidad de reportes de avistamientos verificados válidos.
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking de los 20 mejores usuarios
 */
router.get("/ranking", token.verifyToken, sightingFunctions.getTopRanking);

/**
 * @swagger
 * /api/avistamientos/ranking/{id}:
 *   get:
 *     summary: Obtener la posición de un usuario específico en el ranking
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario consultado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información del puesto (número) y la medalla actual del usuario
 */
router.get("/ranking/:id", token.verifyToken, sightingFunctions.getUserRank);

/**
 * @swagger
 * /api/avistamientos/{id}:
 *   get:
 *     summary: Obtener los detalles específicos de un reporte de avistamiento
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del avistamiento
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles completos del reporte (quién lo hizo, foto, coordenadas, fecha)
 */
router.get("/:id", token.verifyToken, sightingFunctions.readSightingsById);

/**
 * @swagger
 * /api/avistamientos:
 *   post:
 *     summary: Reportar un nuevo avistamiento
 *     description: Sube un reporte con foto opcional sobre la ubicación de un gato
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Foto capturada por el usuario (Opcional)
 *               gatoId:
 *                 type: string
 *               coloniaId:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: El avistamiento se ha subido como pendiente de verificación
 */
router.post(
  "/",
  token.verifyToken,
  upload.single("foto"),
  sightingFunctions.registerSighting,
);

/**
 * @swagger
 * /api/avistamientos/{id}:
 *   put:
 *     summary: Verificar o actualizar el estado de un avistamiento (Admin)
 *     description: Permite al administrador aceptar o rechazar un avistamiento
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del avistamiento a moderar
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *               estado:
 *                 type: string
 *                 description: 'Puede ser: "Verificado", "Rechazado" o "Pendiente"'
 *                 example: Verificado
 *     responses:
 *       200:
 *         description: Estado del reporte actualizado exitosamente
 */
router.put(
  "/:id",
  token.verifyToken,
  upload.single("foto"),
  sightingFunctions.modifySighting,
);

/**
 * @swagger
 * /api/avistamientos/{id}:
 *   delete:
 *     summary: Eliminar un avistamiento permanentemente (Solo Admin)
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte de avistamiento eliminado del historial
 */
router.delete("/:id", token.verifyToken, sightingFunctions.deleteSighting);

module.exports = router;
