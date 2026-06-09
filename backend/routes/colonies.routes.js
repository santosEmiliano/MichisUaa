const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const coloniesFunctions = require("../controllers/colonies.controller");
const { coloniaValidator, updateColoniaValidator, deleteColoniaValidator } = require("../middleware/colonia.validator");
const validate = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Colonias
 *   description: Zonas asignadas dentro de la institución donde habitan los felinos
 */

/**
 * @swagger
 * /api/colonies/public:
 *   get:
 *     summary: Listado público de las colonias activas
 *     tags: [Colonias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Se obtuvo correctamente la lista de colonias para uso general
 */
router.get(
  "/public",
  token.verifyToken,
  coloniesFunctions.readColoniesPublic
)

/**
 * @swagger
 * /api/colonies:
 *   get:
 *     summary: Listado completo e interno de las colonias (Solo Admin)
 *     tags: [Colonias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idEncargado
 *         description: ID de usuario para filtrar colonias asignadas a un encargado en específico
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de colonias obtenida con éxito
 */
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.readColonies
);

/**
 * @swagger
 * /api/colonies/{id}:
 *   get:
 *     summary: Obtener el detalle específico de una colonia (Solo Admin)
 *     tags: [Colonias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la colonia
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos completos de la colonia solicitada
 */
router.get(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.readColonyById
);

/**
 * @swagger
 * /api/colonies:
 *   post:
 *     summary: Crear y registrar una nueva colonia (Solo Admin)
 *     tags: [Colonias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Zona Edificio 108"
 *               idEncargado:
 *                 type: string
 *                 description: ID del administrador/usuario responsable de la colonia
 *               ubicacion:
 *                 type: string
 *                 example: "Detrás de la biblioteca central"
 *     responses:
 *       201:
 *         description: Colonia creada exitosamente
 */
router.post(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  coloniaValidator,
  validate,
  coloniesFunctions.registerColony
);

/**
 * @swagger
 * /api/colonies/{id}:
 *   put:
 *     summary: Editar detalles de una colonia existente (Solo Admin)
 *     tags: [Colonias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               idEncargado:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: La colonia fue actualizada en el sistema
 */
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  updateColoniaValidator,
  validate,
  coloniesFunctions.modifyColony
);

/**
 * @swagger
 * /api/colonies/{id}:
 *   delete:
 *     summary: Borrar una colonia del sistema (Solo Admin)
 *     tags: [Colonias]
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
 *         description: Colonia eliminada con éxito
 */
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  deleteColoniaValidator,
  validate,
  coloniesFunctions.removeColony
);

module.exports = router;