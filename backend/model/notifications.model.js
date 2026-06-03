const prisma = require('../db/prisma')

async function getNotificationsByUser(usuarioId) {
  try {
    return await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return null
  }
}

async function getUnreadCount(usuarioId) {
  try {
    return await prisma.notificacion.count({
      where: { usuarioId, leida: false }
    })
  } catch (error) {
    console.error('Error al contar no leídas:', error)
    return null
  }
}

async function markAsRead(id) {
  try {
    return await prisma.notificacion.update({
      where: { id },
      data: { leida: true }
    })
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error)
    return null
  }
}

async function markAllAsRead(usuarioId) {
  try {
    return await prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true }
    })
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    return null
  }
}

module.exports = {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
