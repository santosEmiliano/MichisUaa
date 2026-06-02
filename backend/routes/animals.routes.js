const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const animalsFunctions = require("../controllers/animals.controller");
const multer = require("../middleware/multer");

const upload = multer("animals");

/**
 * @swagger
 * tags:
 *   name: Gatos
 *   description: Gestión de registro, estado y catálogo de gastos (animales)
 */

/**
 * @swagger
 * /api/animal/public:
 *   get:
 *     summary: Obtener el catálogo público de gatos
 *     description: Retorna la lista de gatos visibles para simpatizantes en la App Móvil.
 *     tags: [Gatos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catálogo recuperado exitosamente
 */
router.get(
  "/public",
  token.verifyToken,
  animalsFunctions.getAnimalsPublic
)

/**
 * @swagger
 * /api/animal:
 *   get:
 *     summary: Obtener el listado completo de gatos (Solo Admin)
 *     description: Recupera todos los gatos sin restricciones para el panel administrativo web.
 *     tags: [Gatos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo de objetos Gato
 */
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.getAnimals
);

/**
 * @swagger
 * /api/animal/{id}:
 *   get:
 *     summary: Obtener el perfil detallado de un gato por su ID (Solo Admin)
 *     tags: [Gatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del gato
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información detallada del felino
 */
router.get(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.getAnimalById
);

/**
 * @swagger
 * /api/animal:
 *   post:
 *     summary: Dar de alta un nuevo gato en el sistema (Solo Admin)
 *     tags: [Gatos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Imagen principal del gato (Archivo subido)
 *               nombre:
 *                 type: string
 *                 example: Bola de Nieve
 *               estado:
 *                 type: string
 *                 example: Registrado
 *               coloniaId:
 *                 type: string
 *                 description: ID de la colonia a la que pertenece
 *     responses:
 *       201:
 *         description: El gato fue registrado exitosamente en la base de datos
 */
router.post(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  upload.single('foto'),
  animalsFunctions.createAnimal
);

/**
 * @swagger
 * /api/animal/{id}:
 *   put:
 *     summary: Modificar la información de un gato existente (Solo Admin)
 *     tags: [Gatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del gato a editar
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
 *                 description: (Opcional) Nueva foto para actualizar
 *               nombre:
 *                 type: string
 *               estado:
 *                 type: string
 *               coloniaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gato actualizado exitosamente
 */
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  upload.single('foto'),
  animalsFunctions.updateAnimal
);

/**
 * @swagger
 * /api/animal/{id}:
 *   delete:
 *     summary: Eliminar un gato del sistema permanentemente (Solo Admin)
 *     tags: [Gatos]
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
 *         description: Gato eliminado exitosamente
 */
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.deleteAnimal
);

module.exports = router;