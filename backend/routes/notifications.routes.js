const express = require('express')
const router = express.Router()
const token = require('../middleware/verifyToken')
const notificationsFunctions = require('../controllers/notifications.controller')

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Gestión de notificaciones de usuarios
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario autenticado
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 */
router.get('/', token.verifyToken, notificationsFunctions.readNotifications)

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener la cantidad de notificaciones no leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de notificaciones no leídas
 */
router.get('/unread-count', token.verifyToken, notificationsFunctions.readUnreadCount)

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.put('/read-all', token.verifyToken, notificationsFunctions.markAllAsRead)

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.put('/:id/read', token.verifyToken, notificationsFunctions.markAsRead)

module.exports = router
