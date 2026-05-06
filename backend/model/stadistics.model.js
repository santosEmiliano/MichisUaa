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

async function getMissingCatsCount() {
  try {
    const totalCats = await prisma.animal.count({
        where: {
            estado: "Desaparecido",
        },
    });
    return totalCats;
  } catch (error) {
    console.error("Error obteniendo total de gatos:", error);
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

module.exports = {
  getAllCats,
  getSterilizedCount,
  getMissingCatsCount,
  getSightingsLastWeekCount,
  getSigningsPerColony,
  getColoniesSummary
};