const prisma = require('../db/prisma');

// Categorías de medallas
const MEDALLAS = {
  AVISTAMIENTOS: 'avistamientos',
  VERIFICADOS: 'verificados',
};

// Función auxiliar para crear o actualizar el nivel de una medalla
const actualizarNivelMedalla = async (usuarioId, tipo, nuevoNivel) => {
  const medalla = await prisma.medalla.findUnique({
    where: { usuarioId_tipo: { usuarioId: Number(usuarioId), tipo } }
  });

  if (!medalla) {
    // Si no existe, la creamos con el nuevoNivel
    return await prisma.medalla.create({
      data: { usuarioId: Number(usuarioId), tipo, nivel: nuevoNivel }
    });
  } else if (medalla.nivel < nuevoNivel) {
    // Si ya existe pero el nivel actual es menor, actualizamos al nuevoNivel
    return await prisma.medalla.update({
      where: { usuarioId_tipo: { usuarioId: Number(usuarioId), tipo } },
      data: { nivel: nuevoNivel, ganadaAt: new Date() } // actualizamos la fecha de obtención
    });
  }
  return null; // si ya tiene ese nivel o superior, no hacemos nada
};

const verificarAvistamientos = async (usuarioId) => {
  try {
    const count = await prisma.avistamiento.count({
      where: { usuarioId: Number(usuarioId) }
    });

    let nivel = 0;
    if (count >= 100) nivel = 5;
    else if (count >= 50) nivel = 4;
    else if (count >= 25) nivel = 3;
    else if (count >= 10) nivel = 2;
    else if (count >= 1) nivel = 1;

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.AVISTAMIENTOS, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarAvistamientos:", error);
    return null;
  }
};

const verificarVerificados = async (usuarioId) => {
  try {
    const count = await prisma.avistamiento.count({
      where: { usuarioId: Number(usuarioId), verificado: true }
    });

    let nivel = 0;
    if (count >= 60) nivel = 5;
    else if (count >= 30) nivel = 4;
    else if (count >= 15) nivel = 3;
    else if (count >= 5) nivel = 2;
    else if (count >= 1) nivel = 1;

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.VERIFICADOS, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarVerificados:", error);
    return null;
  }
};

// Función principal
const verificarMedallas = async (usuarioId) => {
  try {
    const resultados = await Promise.all([
      verificarAvistamientos(usuarioId),
      verificarVerificados(usuarioId),
    ]);

    const nuevas = resultados.filter(Boolean); // devuelve solo las que se actualizaron o crearon
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
