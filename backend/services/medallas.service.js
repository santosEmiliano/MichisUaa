const prisma = require('../db/prisma');

// Tipos de medalla — igual que en el frontend
const MEDALLAS = {
  PRIMER_AVISTAMIENTO: 'primer_avistamiento',
  DIEZ_REPORTES: 'diez_reportes',
  VEINTICINCO_REPORTES: 'veinticinco_reportes',
  CINCUENTA_REPORTES: 'cincuenta_reportes',
  RACHA_7_DIAS: 'racha_7_dias',
  CINCO_COLONIAS: 'cinco_colonias',
  REPORTE_NOCTURNO: 'reporte_nocturno',
};

const verificarPrimerAvistamiento = async (usuarioId) => {
  try {
    const existe = await prisma.medalla.findUnique({
      where: {
        usuarioId_tipo: { usuarioId: Number(usuarioId), tipo: MEDALLAS.PRIMER_AVISTAMIENTO }
      }
    });
    if (existe) return null;

    const count = await prisma.avistamiento.count({
      where: { usuarioId: Number(usuarioId) }
    });

    if (count >= 1) {
      return await prisma.medalla.create({
        data: { usuarioId: Number(usuarioId), tipo: MEDALLAS.PRIMER_AVISTAMIENTO }
      });
    }
    return null;
  } catch (error) {
    console.error("Error en verificarPrimerAvistamiento:", error);
    return null;
  }
};

const verificarConteoAvistamientos = async (usuarioId) => {
  try {
    const count = await prisma.avistamiento.count({
      where: { usuarioId: Number(usuarioId) }
    });
    const ganadas = [];

    if (count >= 10) {
      const ex10 = await prisma.medalla.findUnique({
        where: { usuarioId_tipo: { usuarioId: Number(usuarioId), tipo: MEDALLAS.DIEZ_REPORTES } }
      });
      if (!ex10) {
        ganadas.push(await prisma.medalla.create({
          data: { usuarioId: Number(usuarioId), tipo: MEDALLAS.DIEZ_REPORTES }
        }));
      }
    }

    if (count >= 25) {
      const ex25 = await prisma.medalla.findUnique({
        where: { usuarioId_tipo: { usuarioId: Number(usuarioId), tipo: MEDALLAS.VEINTICINCO_REPORTES } }
      });
      if (!ex25) {
        ganadas.push(await prisma.medalla.create({
          data: { usuarioId: Number(usuarioId), tipo: MEDALLAS.VEINTICINCO_REPORTES }
        }));
      }
    }

    if (count >= 50) {
      const ex50 = await prisma.medalla.findUnique({
        where: { usuarioId_tipo: { usuarioId: Number(usuarioId), tipo: MEDALLAS.CINCUENTA_REPORTES } }
      });
      if (!ex50) {
        ganadas.push(await prisma.medalla.create({
          data: { usuarioId: Number(usuarioId), tipo: MEDALLAS.CINCUENTA_REPORTES }
        }));
      }
    }

    return ganadas.length > 0 ? ganadas : null;
  } catch (error) {
    console.error("Error en verificarConteoAvistamientos:", error);
    return null;
  }
};

const verificarRacha = async (usuarioId) => {
  // TODO: Implementar verificación de que el usuario ha hecho avistamietnos 7 días seguidos
  return null;
};

const verificarColonias = async (usuarioId) => {
  // TODO: Implementar verificación de que el usuario ha hecho avistamientos de gatos pertenecientes a 5 colonias diferentes
  return null;
};

const verificarNocturno = async (usuarioId) => {
  try {
    const existe = await prisma.medalla.findUnique({
      where: {
        usuarioId_tipo: { usuarioId: Number(usuarioId), tipo: MEDALLAS.REPORTE_NOCTURNO }
      }
    });
    if (existe) return null;

    const avistamientos = await prisma.avistamiento.findMany({
      where: { usuarioId: Number(usuarioId) },
      select: { createdAt: true }
    });

    const tieneNocturno = avistamientos.some(a => {
      // Convertir la fecha UTC de la base de datos a la zona horaria de Aguascalientes / CDMX
      const options = { timeZone: 'America/Mexico_City', hour: 'numeric', hour12: false };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const hourString = formatter.format(a.createdAt);
      const hour = parseInt(hourString, 10);

      return hour >= 21 || hour <= 5; // Entre las 9 PM (21:00) y las 5 AM (05:00) en horario de Aguascalientes
    });

    if (tieneNocturno) {
      return await prisma.medalla.create({
        data: { usuarioId: Number(usuarioId), tipo: MEDALLAS.REPORTE_NOCTURNO }
      });
    }
    return null;
  } catch (error) {
    console.error("Error en verificarNocturno:", error);
    return null;
  }
};

// Función principal
const verificarMedallas = async (usuarioId) => {
  try {
    const resultados = await Promise.all([
      verificarPrimerAvistamiento(usuarioId),
      verificarConteoAvistamientos(usuarioId),
      verificarRacha(usuarioId),
      verificarColonias(usuarioId),
      verificarNocturno(usuarioId),
    ]);

    const nuevas = resultados.flat().filter(Boolean); // devuelve solo las que se ganaron
    return nuevas;
  } catch (error) {
    console.error("Error al verificar medallas:", error);
    return [];
  }
};

module.exports = {
  verificarMedallas,
  MEDALLAS
};
