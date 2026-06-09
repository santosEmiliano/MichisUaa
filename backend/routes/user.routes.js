const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const userFunctions = require("../controllers/user.controller");
const { authLimiter } = require("../middleware/rateLimiter");
const { loginValidator, registerValidator, updateUserValidator, deleteUserValidator, pushTokenValidator } = require("../middleware/user.validator");
const validate = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios, autenticación y credenciales
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@michis.uaa.mx
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna el token JWT y datos de usuario
 */
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  userFunctions.login
);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener todos los usuarios del sistema (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna un arreglo con todos los usuarios registrados
 */
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  userFunctions.obtainUsers
);

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar un nuevo usuario en la base de datos
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@michis.uaa.mx
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *                 example: Simpatizante
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post(
  "/register",
  registerValidator,
  validate,
  userFunctions.createUser
);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Cerrar la sesión activa del usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión invalidada/cerrada con éxito
 */
router.post(
  "/logout",
  token.verifyToken,
  userFunctions.logout
);

/**
 * @swagger
 * /api/user/{id}/medallas:
 *   get:
 *     summary: Obtener las medallas ganadas por un usuario específico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Objeto con la lista de medallas y logros del usuario
 */
router.get(
  "/:id/medallas",
  token.verifyToken,
  userFunctions.getUserMedals
);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Actualizar la información de un usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a editar
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
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *                 example: Administrador
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 */
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  updateUserValidator,
  validate,
  userFunctions.updateUser
);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado del sistema
 */
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  deleteUserValidator,
  validate,
  userFunctions.removeUser
);

/**
 * @swagger
 * /api/user/push-token:
 *   put:
 *     summary: Registrar o actualizar el token push de Expo (Notificaciones Móviles)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pushToken:
 *                 type: string
 *                 example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *     responses:
 *       200:
 *         description: Push token actualizado exitosamente
 */
router.put(
  "/push-token",
  token.verifyToken,
  pushTokenValidator,
  validate,
  userFunctions.updatePushToken
);

/**
 * @swagger
 * /api/user/refresh:
 *   post:
 *     summary: Renovar el Access Token usando el Refresh Token
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retorna un nuevo Access Token
 *       401:
 *         description: Refresh Token no proporcionado
 *       403:
 *         description: Refresh Token inválido o expirado
 */
router.post(
  "/refresh",
  userFunctions.refreshToken
);

module.exports = router;