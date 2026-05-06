const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllCats() {
  try {
    const totalCats = await prisma.animal.count();
    return totalCats;
  } catch (error) {
    console.error("Error obteniendo total de gatos:", error);
    throw error;
  } 
}

module.exports = {
  getAllCats,
};