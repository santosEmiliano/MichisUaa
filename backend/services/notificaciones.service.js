const prisma = require('../db/prisma')
const { sendPushNotification } = require('./push.service')

const notificarNuevoAvistamiento = async (avistamiento) => {
    let adminsDestino = []

    if (avistamiento.animalId) {
        // Hay animal identificado → solo admins de esa colonia
        const animal = await prisma.animal.findUnique({
            where: { idAnimal: avistamiento.animalId },
            include: {
                colonia: {
                    include: {
                        usuariosCols: { include: { usuario: true } }
                    }
                }
            }
        })

        adminsDestino = animal.colonia.usuariosCols
            .map(uc => uc.usuario)
            .filter(u => u.admin)

    } else {
        // Sin animal → todos los admins
        adminsDestino = await prisma.usuario.findMany({
            where: { admin: true }
        })
    }

    if (adminsDestino.length === 0) return

    // Crear notificación en BD para cada admin
    await prisma.notificacion.createMany({
        data: adminsDestino.map(admin => ({
            usuarioId: admin.idUsuario,
            tipo: 'avistamiento_nuevo',
            titulo: avistamiento.animalId
                ? `Nuevo avistamiento — ${animal.nombre}`
                : 'Nuevo avistamiento sin identificar',
            descripcion: `Reportado por ${avistamiento.usuario.nombre} · ${avistamiento.ubicacionTexto || 'Campus UAA'}`,
            url: `/avistamientos/${avistamiento.idAvistamiento}`
        }))
    })

    // Push notification a cada admin
    for (const admin of adminsDestino) {
        if (admin.pushToken) {
            await sendPushNotification(admin.pushToken, {
                titulo: 'Nuevo avistamiento pendiente',
                descripcion: avistamiento.animalId
                    ? `Se vio a ${animal.nombre} en el campus`
                    : 'Hay un avistamiento sin identificar pendiente de revisión'
            })
        }
    }
}

module.exports = { notificarNuevoAvistamiento }