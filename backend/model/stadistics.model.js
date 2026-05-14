const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSterilizedCount() {
  try {
    const totalCats = await prisma.animal.count({
        where: {
            esterilizado: true,
        },
    });
    return totalCats;
  } catch (error) {
    console.error("Error obteniendo total de gatos:", error);
    throw error;
  } 
}

async function getAllCats() {
  try {
    const totalCats = await prisma.animal.count();
    return totalCats;
  } catch (error) {
    console.error("Error obteniendo total de gatos:", error);
    throw error;
  } 
}

async function getCatsAddedThisWeek() {
  try {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 7);
    
    const count = await prisma.animal.count({
      where: {
        createdAt: {
          gte: fecha,
        },
      },
    });
    return count;
  } catch (error) {
    console.error("Error obteniendo gatos agregados esta semana:", error);
    throw error;
  }
}

async function getAllCatsLastWeek() {
  try {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 7);
    const count = await prisma.animal.count({
      where: {
        createdAt: {
          lt: fecha,
        },
      },
    });
    return count;
  } catch (error) {
    console.error("Error obteniendo total de gatos de la semana pasada:", error);
    throw error;
  }
}

async function getSterilizedCountLastWeek() {
  try {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 7);
    const count = await prisma.animal.count({
      where: {
        createdAt: { lt: fecha },
        OR: [
          { 
            fecha_esterilizacion: { lt: fecha } 
          },
          { 
            fecha_esterilizacion: null, 
            esterilizado: true 
          }
        ]
      },
    });
    return count;
  } catch (error) {
    console.error("Error obteniendo gatos esterilizados de la semana pasada:", error);
    throw error;
  }
}

async function getMissingCatsCount() {
  try {
    const totalCats = await prisma.animal.count({
        where: {
            estado: "Desaparecido",
        },
    });
    return totalCats;
  } catch (error) {
    console.error("Error obteniendo total de gatos desaparecidos:", error);
    throw error;
  } 
}

async function getSightingsLastWeekCount(fecha) {
  try {
    const totalAvistamientos = await prisma.avistamiento.count({
      where: {
        createdAt: {
          gte: fecha,
        },
      },
    });
    return totalAvistamientos;
  } catch (error) {
    console.error("Error obteniendo total de avistamientos:", error);
    throw error;
  } 
}

async function getSigningsPerColony() {
  try {
    const colonias = await prisma.colonia.findMany({
      select: {
        idColonia: true,
        nombre: true
      }
    });
    
    const resultados = [];
    
    for (const colonia of colonias) {
      const totalAvistamientos = await prisma.avistamiento.count({
        where: {
          animal: {
            Colonia_idColonia: colonia.idColonia
          }
        }
      });
      
      resultados.push({
        colonia: colonia.nombre,
        total: totalAvistamientos
      });
    }
    
    return resultados;
  } catch (error) {
    console.error("Error obteniendo avistamientos por colonia:", error);
    throw error;
  } 
}

async function getColoniesSummary() {
  try {
    const colonias = await prisma.colonia.findMany({
      select: {
        idColonia: true,
        nombre: true
      }
    });

    const resumen = [];

    for (const colonia of colonias) {
      const totalGatos = await prisma.animal.count({
        where: { Colonia_idColonia: colonia.idColonia }
      });

      const esterilizados = await prisma.animal.count({
        where: {
          Colonia_idColonia: colonia.idColonia,
          esterilizado: true
        }
      });

      const porcentaje = totalGatos > 0 ? Math.round((esterilizados / totalGatos) * 100) : 0;

      resumen.push({
        nombreColonia: colonia.nombre,
        totalGatos: totalGatos,
        porcentajeEsterilizados: porcentaje
      });
    }

    return resumen;
  } catch (error) {
    console.error("Error obteniendo resumen de colonias:", error);
    throw error;
  } 
}

async function getSightingsTendency() {
  try {
    const oldest = await prisma.avistamiento.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });

    if (!oldest) return [];

    const now = new Date();
    const start = new Date(oldest.createdAt);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());

    const semanas = [];
    let weekStart = new Date(start);
    let semanaNum = 1;

    while (weekStart <= now) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = await prisma.avistamiento.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      });

      semanas.push({
        name: `Sem ${semanaNum}`,
        value: count
      });

      weekStart = weekEnd;
      semanaNum++;
    }

    return semanas;
  } catch (error) {
    console.error("Error obteniendo tendencia de avistamientos:", error);
    throw error;
  }
}

async function getSterilizedState() {
  try {
    const esterilizados = await prisma.animal.count({
      where: { esterilizado: true }
    });
    const noEsterilizados = await prisma.animal.count({
      where: { esterilizado: false }
    });

    const desaparecidos = await prisma.animal.count({
      where: { estado: "Desaparecido" }
    });

    return [
      { name: "Esterilizados", value: esterilizados, color: "#2B9E76" },
      { name: "Sin esterilizar", value: noEsterilizados, color: "#E8893C" },
      { name: "Desaparecidos", value: desaparecidos, color: "#E05252" }
    ];
  } catch (error) {
    console.error("Error obteniendo estado de esterilización:", error);
    throw error;
  } 
}

module.exports = {
  getAllCats,
  getCatsAddedThisWeek,
  getAllCatsLastWeek,
  getSterilizedCountLastWeek,
  getSterilizedCount,
  getMissingCatsCount,
  getSightingsLastWeekCount,
  getSigningsPerColony,
  getColoniesSummary,
  getSightingsTendency,
  getSterilizedState
};