const prisma = require('../db/prisma');

// Categorías de medallas
const MEDALLAS = {
  AVISTAMIENTOS: 'avistamientos',
  VERIFICADOS: 'verificados',
  RACHA: 'racha',
  COLONIAS: 'colonias',
  FAVORITO: 'favorito',
  NOCTURNO: 'nocturno',
  INCOMPRENDIDO: 'incomprendido',
  DETECTIVE: 'detective',
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

const verificarFavorito = async (usuarioId) => {
  try {
    const grupos = await prisma.avistamiento.groupBy({ // Agrupa avistamientos por animal y obtiene el conteo
      by: ['animalId'],
      where: { usuarioId: Number(usuarioId), animalId: { not: null } },
      _count: { _all: true }
    });

    // Encontrar el número máximo de reportes para un único gato
    const maxCount = grupos.reduce((max, g) => Math.max(max, g._count._all), 0);

    let nivel = 0;
    if (maxCount >= 25) nivel = 5; // 25 avistamientos del mismo gato = nivel 5
    else if (maxCount >= 15) nivel = 4; // 15 avistamientos = nivel 4
    else if (maxCount >= 10) nivel = 3; // 10 avistamientos = nivel 3
    else if (maxCount >= 5) nivel = 2; // 5 avistamientos = nivel 2
    else if (maxCount >= 3) nivel = 1; // 3 avistamientos = nivel 1

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.FAVORITO, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarFavorito:", error);
    return null;
  }
};

const verificarNocturno = async (usuarioId) => {
  try {
    const avistamientos = await prisma.avistamiento.findMany({
      where: { usuarioId: Number(usuarioId) },
      select: { createdAt: true }
    });

    let nocturnosCount = 0;
    // Formatear la hora ajustada a la zona de Aguascalientes / CDMX
    const options = { timeZone: 'America/Mexico_City', hour: 'numeric', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    avistamientos.forEach(a => {
      const hourString = formatter.format(a.createdAt);
      const hour = parseInt(hourString, 10);
      if (hour >= 21 || hour <= 5) { // Horario nocturno de 9 PM a 5 AM
        nocturnosCount++;
      }
    });

    let nivel = 0;
    if (nocturnosCount >= 30) nivel = 5; // 30 reportes nocturnos = nivel 5
    else if (nocturnosCount >= 15) nivel = 4; // 15 reportes nocturnos = nivel 4
    else if (nocturnosCount >= 7) nivel = 3; // 7 reportes nocturnos = nivel 3
    else if (nocturnosCount >= 3) nivel = 2; // 3 reportes nocturnos = nivel 2
    else if (nocturnosCount >= 1) nivel = 1; // 1 reporte nocturno = nivel 1

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.NOCTURNO, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarNocturno:", error);
    return null;
  }
};

const verificarIncomprendido = async (usuarioId) => {
  try {
    const count = await prisma.avistamiento.count({ // Cuenta los avistamientos no verificados por un admin
      where: { usuarioId: Number(usuarioId), verificado: false, verificadoPor: { not: null } }
    });

    let nivel = 0;
    if (count >= 20) nivel = 5; // 20 reportes rechazados = nivel 5
    else if (count >= 12) nivel = 4; // 12 reportes rechazados = nivel 4
    else if (count >= 7) nivel = 3; // 7 reportes rechazados = nivel 3
    else if (count >= 3) nivel = 2; // 3 reportes rechazados = nivel 2
    else if (count >= 1) nivel = 1; // 1 reporte rechazado = nivel 1

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.INCOMPRENDIDO, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarIncomprendido:", error);
    return null;
  }
};

const verificarDetective = async (usuarioId) => {
  try {
    const count = await prisma.avistamiento.count({ // Cuenta avistamientos del usuario donde el gato esté reportado como Desaparecido
      where: {
        usuarioId: Number(usuarioId),
        animal: { estado: 'Desaparecido' }
      }
    });

    let nivel = 0;
    if (count >= 15) nivel = 5; // 15 reportes de desaparecidos = nivel 5
    else if (count >= 10) nivel = 4; // 10 reportes = nivel 4
    else if (count >= 6) nivel = 3; // 6 reportes = nivel 3
    else if (count >= 3) nivel = 2; // 3 reportes = nivel 2
    else if (count >= 1) nivel = 1; // 1 reporte = nivel 1

    if (nivel > 0) {
      return await actualizarNivelMedalla(usuarioId, MEDALLAS.DETECTIVE, nivel);
    }
    return null;
  } catch (error) {
    console.error("Error en verificarDetective:", error);
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
      verificarFavorito(usuarioId),
      verificarNocturno(usuarioId),
      verificarIncomprendido(usuarioId),
      verificarDetective(usuarioId),
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
