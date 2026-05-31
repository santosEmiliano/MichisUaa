const prisma = require('../db/prisma')
const { sendPushNotification } = require('./push.service')

const notificarNuevoAvistamiento = async (avistamiento) => {
    let adminsDestino = []
    let animal = null

    if (avistamiento.animalId) {
        animal = await prisma.animal.findUnique({
            where: { idAnimal: avistamiento.animalId },
            include: {
                colonia: {
                    include: {
                        usuariosCols: { include: { usuario: true } }
                    }
                }
            }
        })

        if (!animal) return

        adminsDestino = animal.colonia.usuariosCols
            .map(uc => uc.usuario)
            .filter(u => u.admin)

    } else {
        adminsDestino = await prisma.usuario.findMany({
            where: { admin: true }
        })
    }

    if (adminsDestino.length === 0) return

    const reportante = await prisma.usuario.findUnique({
        where: { idUsuario: avistamiento.usuarioId }
    })

    const nombreReportante = reportante?.nombre || 'Usuario desconocido'
    const ubicacion = `${avistamiento.latitud}, ${avistamiento.longitud}`

    await prisma.notificacion.createMany({
        data: adminsDestino.map(admin => ({
            usuarioId: admin.idUsuario,
            tipo: 'avistamiento_nuevo',
            titulo: avistamiento.animalId && animal
                ? `Nuevo avistamiento — ${animal.nombre}`
                : 'Nuevo avistamiento sin identificar',
            descripcion: `Reportado por ${nombreReportante} · ${ubicacion}`,
            url: `/avistamientos/${avistamiento.idAvistamiento}`
        }))
    })

    for (const admin of adminsDestino) {
        if (admin.pushToken) {
            await sendPushNotification(admin.pushToken, {
                titulo: 'Nuevo avistamiento pendiente',
                descripcion: avistamiento.animalId && animal
                    ? `Se vio a ${animal.nombre} en el campus`
                    : 'Hay un avistamiento sin identificar pendiente de revisión'
            })
        }
    }
}

const notificarAvistamientoVerificado = async (avistamiento, adminId) => {
    const admin = await prisma.usuario.findUnique({ where: { idUsuario: adminId } })
    const adminNombre = admin?.nombre || 'Administrador'

    const reporterNotification = {
        usuarioId: avistamiento.usuarioId,
        tipo: 'avistamiento_verificado',
        titulo: 'Avistamiento verificado',
        descripcion: `Tu avistamiento fue verificado por ${adminNombre}`,
        url: `/avistamientos/${avistamiento.idAvistamiento}`
    }

    await prisma.notificacion.create({ data: reporterNotification })

    if (avistamiento.usuario?.pushToken) {
        await sendPushNotification(avistamiento.usuario.pushToken, {
            titulo: 'Avistamiento verificado',
            descripcion: `Tu avistamiento fue verificado por ${adminNombre}`
        })
    }
}

const notificarAvistamientoRechazado = async (avistamiento, adminId) => {
    const admin = await prisma.usuario.findUnique({ where: { idUsuario: adminId } })
    const adminNombre = admin?.nombre || 'Administrador'

    const reporterNotification = {
        usuarioId: avistamiento.usuarioId,
        tipo: 'avistamiento_rechazado',
        titulo: 'Avistamiento rechazado',
        descripcion: `Tu avistamiento fue revisado por ${adminNombre}`,
        url: `/avistamientos/${avistamiento.idAvistamiento}`
    }

    await prisma.notificacion.create({ data: reporterNotification })

    if (avistamiento.usuario?.pushToken) {
        await sendPushNotification(avistamiento.usuario.pushToken, {
            titulo: 'Avistamiento rechazado',
            descripcion: `Tu avistamiento fue revisado por ${adminNombre}`
        })
    }
}

const notificarAvistamientoRevocado = async (avistamiento) => {
    const reporterNotification = {
        usuarioId: avistamiento.usuarioId,
        tipo: 'sistema',
        titulo: 'Estado de avistamiento actualizado',
        descripcion: 'Tu avistamiento ha vuelto a estado pendiente de revisión',
        url: `/avistamientos/${avistamiento.idAvistamiento}`
    }

    await prisma.notificacion.create({ data: reporterNotification })

    if (avistamiento.usuario?.pushToken) {
        await sendPushNotification(avistamiento.usuario.pushToken, {
            titulo: 'Avistamiento pendiente',
            descripcion: 'Tu avistamiento ha vuelto a estado pendiente de revisión'
        })
    }
}

module.exports = {
    notificarNuevoAvistamiento,
    notificarAvistamientoVerificado,
    notificarAvistamientoRechazado,
    notificarAvistamientoRevocado
}