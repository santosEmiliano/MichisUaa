const notificationsModel = require('../model/notifications.model')

const readNotifications = async (req, res) => {
  try {
    const notifications = await notificationsModel.getNotificationsByUser(req.userId)
    if (!notifications) {
      return res.status(500).json({ mensaje: 'Error al obtener las notificaciones' })
    }
    return res.status(200).json(notifications)
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

const readUnreadCount = async (req, res) => {
  try {
    const count = await notificationsModel.getUnreadCount(req.userId)
    if (count === null) {
      return res.status(500).json({ mensaje: 'Error al obtener el conteo' })
    }
    return res.status(200).json({ noLeidas: count })
  } catch (error) {
    console.error('Error al obtener conteo de no leídas:', error)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const notificacion = await notificationsModel.markAsRead(Number(id))
    if (!notificacion) {
      return res.status(404).json({ mensaje: 'Notificación no encontrada' })
    }
    return res.status(200).json({ mensaje: 'Notificación marcada como leída', notificacion })
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationsModel.markAllAsRead(req.userId)
    return res.status(200).json({
      mensaje: 'Todas las notificaciones marcadas como leídas',
      actualizadas: result.count
    })
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

module.exports = {
  readNotifications,
  readUnreadCount,
  markAsRead,
  markAllAsRead
}
