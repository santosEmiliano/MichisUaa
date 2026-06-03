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

const notificarGatoNuevo = async (animal, coloniaNombre) => {
    const adminsColonia = await prisma.usuarioCol.findMany({
        where: { Colonia_idColonia: animal.Colonia_idColonia },
        include: { usuario: true }
    })

    const adminsDestino = adminsColonia
        .map(uc => uc.usuario)
        .filter(u => u.admin)

    if (adminsDestino.length === 0) return

    await prisma.notificacion.createMany({
        data: adminsDestino.map(admin => ({
            usuarioId: admin.idUsuario,
            tipo: 'gato_nuevo',
            titulo: 'Nuevo gato registrado',
            descripcion: `Se registró a ${animal.nombre} en la colonia ${coloniaNombre}`,
            url: `/gatos/${animal.idAnimal}`
        }))
    })

    for (const admin of adminsDestino) {
        if (admin.pushToken) {
            await sendPushNotification(admin.pushToken, {
                titulo: 'Nuevo gato registrado',
                descripcion: `Se registró a ${animal.nombre} en la colonia ${coloniaNombre}`
            })
        }
    }
}

const notificarGatoDesaparecido = async (animal, coloniaNombre) => {
    const todosUsuarios = await prisma.usuario.findMany()

    if (todosUsuarios.length === 0) return

    await prisma.notificacion.createMany({
        data: todosUsuarios.map(u => ({
            usuarioId: u.idUsuario,
            tipo: 'gato_desaparecido',
            titulo: 'Gato desaparecido',
            descripcion: `${animal.nombre} de la colonia ${coloniaNombre} fue reportado como desaparecido`,
            url: `/gatos/${animal.idAnimal}`
        }))
    })

    for (const user of todosUsuarios) {
        if (user.pushToken) {
            await sendPushNotification(user.pushToken, {
                titulo: 'Gato desaparecido',
                descripcion: `${animal.nombre} de la colonia ${coloniaNombre} fue reportado como desaparecido`
            })
        }
    }
}

const notificarGatoRecuperado = async (animal, coloniaNombre) => {
    const todosUsuarios = await prisma.usuario.findMany()

    if (todosUsuarios.length === 0) return

    await prisma.notificacion.createMany({
        data: todosUsuarios.map(u => ({
            usuarioId: u.idUsuario,
            tipo: 'sistema',
            titulo: 'Gato recuperado',
            descripcion: `${animal.nombre} de la colonia ${coloniaNombre} ya no está desaparecido`,
            url: `/gatos/${animal.idAnimal}`
        }))
    })

    for (const user of todosUsuarios) {
        if (user.pushToken) {
            await sendPushNotification(user.pushToken, {
                titulo: 'Gato recuperado',
                descripcion: `${animal.nombre} de la colonia ${coloniaNombre} ya no está desaparecido`
            })
        }
    }
}

module.exports = {
    notificarNuevoAvistamiento,
    notificarAvistamientoVerificado,
    notificarAvistamientoRechazado,
    notificarAvistamientoRevocado,
    notificarGatoNuevo,
    notificarGatoDesaparecido,
    notificarGatoRecuperado
}