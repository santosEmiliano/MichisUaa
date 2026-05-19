const prisma = require('../db/prisma');

// Categorías de medallas
const MEDALLAS = {
  AVISTAMIENTOS: 'avistamientos',
  VERIFICADOS: 'verificados',
  RACHA: 'racha',
  COLONIAS: 'colonias',
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

const verificarRacha = async (usuarioId) => {
  try {
    const avistamientos = await prisma.avistamiento.findMany({
      where: { usuarioId: Number(usuarioId) },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (avistamientos.length < 3) return null; // Si no tiene más de 3 avistamientos, no tiene caso verificar las rachas

    // Extraer fechas únicas en formato YYYY-MM-DD ajustado a la zona horaria de Aguascalientes / CDMX
    const fechasUnicas = [...new Set(avistamientos.map(a => {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(a.createdAt);
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      return `${year}-${month}-${day}`;
    }))];

    if (fechasUnicas.length < 3) return null; // Si no tiene más de 3 fechas de avistamientos únicas, no tiene caso verificar las rachas

    let maxRacha = 1;
    let rachaActual = 1;

    for (let i = 0; i < fechasUnicas.length - 1; i++) {
      const fechaActual = new Date(fechasUnicas[i]);
      const fechaAnterior = new Date(fechasUnicas[i + 1]);
      const diffTime = Math.abs(fechaActual - fechaAnterior);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Obtener diferencia en días

      if (diffDays === 1) { // Si la diferencia es 1 día, es racha
        rachaActual++;
        if (rachaActual > maxRacha) { // Si la racha actual es mayor a la racha máxima, se actualiza
          maxRacha = rachaActual;
        }
      } else { // Si la diferencia no es 1 día, se reinicia la racha
        rachaActual = 1;
      }
    }

    // Asignar nivel basado en la racha máxima
    let nivel = 0;
    if (maxRacha >= 30) nivel = 5; // 30 días = nivel 5
    else if (maxRacha >= 21) nivel = 4; // 21 días = nivel 4
    else if (maxRacha >= 14) nivel = 3; // 14 días = nivel 3
    else if (maxRacha >= 7) nivel = 2; // 7 días = nivel 2
    else if (maxRacha >= 3) nivel = 1; // 3 días = nivel 1

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.RACHA, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarRacha:", error);
    return null;
  }
};

const verificarColonias = async (usuarioId) => {
  try {
    const avistamientos = await prisma.avistamiento.findMany({ //Obtiene avistamientos del usuario donde el animal no sea nulo y además incluye la colonia del animal
      where: { usuarioId: Number(usuarioId), animalId: { not: null } },
      include: { animal: { select: { Colonia_idColonia: true } } }
    });

    const coloniasUnicas = new Set( //Obtiene las colonias únicas del usuario
      avistamientos
        .map(a => a.animal?.Colonia_idColonia)
        .filter(id => id !== undefined && id !== null)
    );

    const count = coloniasUnicas.size; // Cantidad de colonias únicas
    let nivel = 0;
    if (count >= 10) nivel = 5; // 10 colonias = nivel 5
    else if (count >= 7) nivel = 4; // 7 colonias = nivel 4
    else if (count >= 5) nivel = 3; // 5 colonias = nivel 3
    else if (count >= 3) nivel = 2; // 3 colonias = nivel 2
    else if (count >= 2) nivel = 1;

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.COLONIAS, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarColonias:", error);
    return null;
  }
};

// Función principal
const verificarMedallas = async (usuarioId) => {
  try {
    const resultados = await Promise.all([
      verificarAvistamientos(usuarioId),
      verificarVerificados(usuarioId),
      verificarRacha(usuarioId),
      verificarColonias(usuarioId),
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
