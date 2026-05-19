export interface NivelConfig {
  nivel: number;
  nombre: string;
  descripcion: string;
  condicion: number;
  icono: string;
}

export interface MedallaConfig {
  tipo: string;
  nombre: string;
  icono: string;
  color: string;
  colorFondo: string;
  niveles: NivelConfig[];
}

export const MEDALLAS: Record<string, MedallaConfig> = {
  avistamientos: {
    tipo: 'avistamientos',
    nombre: 'Observador',
    icono: '🐾',
    color: '#B86C10',
    colorFondo: '#FEF3E2',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Primera huella', 
        icono: '🥉', 
        descripcion: '¡Bienvenido al equipo! Acabas de hacer tu primer reporte. Los michis te lo agradecen.', 
        condicion: 1 
      },
      { 
        nivel: 2, 
        nombre: 'Observador', 
        icono: '🥈', 
        descripcion: 'Ya llevas 10 reportes. Estás empezando a conocer bien el campus.', 
        condicion: 10 
      },
      { 
        nivel: 3, 
        nombre: 'Guardián', 
        icono: '🥇', 
        descripcion: '25 reportes. Los responsables de colonia confían en tus ojos.', 
        condicion: 25 
      },
      { 
        nivel: 4, 
        nombre: 'Leyenda felina', 
        icono: '💎', 
        descripcion: '50 reportes. Eres uno de los colaboradores más activos del campus.', 
        condicion: 50 
      },
      { 
        nivel: 5, 
        nombre: 'Héroe de los michis', 
        icono: '👑', 
        descripcion: '100 reportes. Sin personas como tú, este programa no sería posible.', 
        condicion: 100 
      },
    ],
  },
  verificados: {
    tipo: 'verificados',
    nombre: 'Reportero confiable',
    icono: '⭐',
    color: '#004D40',
    colorFondo: '#E0F2F1',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Primera verificación', 
        icono: '🥉', 
        descripcion: 'Tu primer reporte fue verificado. ¡Buen ojo!', 
        condicion: 1 
      },
      { 
        nivel: 2, 
        nombre: 'Fuente segura', 
        icono: '🥈', 
        descripcion: '5 reportes verificados. Los admins saben que pueden confiarte.', 
        condicion: 5 
      },
      { 
        nivel: 3, 
        nombre: 'Ojo experto', 
        icono: '🥇', 
        descripcion: '15 verificados. Tu criterio al reportar es excelente.', 
        condicion: 15 
      },
      { 
        nivel: 4, 
        nombre: 'Fotógrafo de campo', 
        icono: '💎', 
        descripcion: '30 verificados. Eres una fuente de información clave para el programa.', 
        condicion: 30 
      },
      { 
        nivel: 5, 
        nombre: 'Corresponsal michis', 
        icono: '👑', 
        descripcion: '60 verificados. El nivel de un responsable de colonia honorario.', 
        condicion: 60 
      },
    ],
  },
  racha: {
    tipo: 'racha',
    nombre: 'Racha',
    icono: '🔥',
    color: '#5856D6',
    colorFondo: '#ECE8FF',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Constante', 
        icono: '🥉', 
        descripcion: '3 días seguidos reportando. ¡Vas bien!', 
        condicion: 3 
      },
      { 
        nivel: 2, 
        nombre: 'Dedicado', 
        icono: '🥈', 
        descripcion: 'Una semana entera. Los michis ya te esperan cada día.', 
        condicion: 7 
      },
      { 
        nivel: 3, 
        nombre: 'Comprometido', 
        icono: '🥇', 
        descripcion: 'Dos semanas sin fallar. Esto ya es un hábito.', 
        condicion: 14 
      },
      { 
        nivel: 4, 
        nombre: 'Imparable', 
        icono: '💎', 
        descripcion: '21 días. Muy pocas personas llegan hasta aquí.', 
        condicion: 21 
      },
      { 
        nivel: 5, 
        nombre: 'Guardián eterno', 
        icono: '👑', 
        descripcion: 'Un mes completo. Eres parte del alma del programa.', 
        condicion: 30 
      },
    ],
  },
  colonias: {
    tipo: 'colonias',
    nombre: 'Explorador',
    icono: '🗺️',
    color: '#007AFF',
    colorFondo: '#E6F2FF',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Curioso', 
        icono: '🥉', 
        descripcion: 'Reportaste en 2 colonias diferentes. El campus es más grande de lo que parece.', 
        condicion: 2 
      },
      { 
        nivel: 2, 
        nombre: 'Explorador', 
        icono: '🥈', 
        descripcion: 'Ya conoces 3 colonias. Cada zona tiene sus propios michis.', 
        condicion: 3 
      },
      { 
        nivel: 3, 
        nombre: 'Conocedor del campus', 
        icono: '🥇', 
        descripcion: '5 colonias visitadas. Conoces el campus mejor que muchos.', 
        condicion: 5 
      },
      { 
        nivel: 4, 
        nombre: 'Cartógrafo felino', 
        icono: '💎', 
        descripcion: '7 colonias. Ya trazaste casi todo el mapa michis de la UAA.', 
        condicion: 7 
      },
      { 
        nivel: 5, 
        nombre: 'Embajador del campus', 
        icono: '👑', 
        descripcion: 'Reportaste en cada colonia activa. El campus entero está en tus manos.', 
        condicion: 10 
      },
    ],
  },
  favorito: {
    tipo: 'favorito',
    nombre: 'Mi favorito',
    icono: '😻',
    color: '#D81B60',
    colorFondo: '#FCE4EC',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Lo reconocí', 
        icono: '🥉', 
        descripcion: 'Ya reconoces a este michi entre todos. Algo especial está pasando.', 
        condicion: 3 
      },
      { 
        nivel: 2, 
        nombre: 'Mi michi de confianza', 
        icono: '🥈', 
        descripcion: '5 veces seguiste a este gato. Creo que ya tiene un fan.', 
        condicion: 5 
      },
      { 
        nivel: 3, 
        nombre: 'Vínculo especial', 
        icono: '🥇', 
        descripcion: '10 avistamientos del mismo gato. Definitivamente es tu favorito.', 
        condicion: 10 
      },
      { 
        nivel: 4, 
        nombre: 'Cuidador informal', 
        icono: '💎', 
        descripcion: '15 reportes. Este michi no sabe que tiene un guardián personal.', 
        condicion: 15 
      },
      { 
        nivel: 5, 
        nombre: 'Inseparables', 
        icono: '👑', 
        descripcion: '25 veces. Si este gato pudiera hablar, sabría tu nombre.', 
        condicion: 25 
      },
    ],
  },
  nocturno: {
    tipo: 'nocturno',
    nombre: 'Guardián nocturno',
    icono: '🌙',
    color: '#1A237E',
    colorFondo: '#E8EAF6',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Trasnochador', 
        icono: '🥉', 
        descripcion: 'Reportaste de noche. Los michis también necesitan vigilancia después del sol.', 
        condicion: 1 
      },
      { 
        nivel: 2, 
        nombre: 'Vigilante', 
        icono: '🥈', 
        descripcion: '3 reportes nocturnos. El campus de noche tiene sus secretos.', 
        condicion: 3 
      },
      { 
        nivel: 3, 
        nombre: 'Guardián nocturno', 
        icono: '🥇', 
        descripcion: '7 veces que estuviste ahí cuando otros dormían.', 
        condicion: 7 
      },
      { 
        nivel: 4, 
        nombre: 'Centinela', 
        icono: '💎', 
        descripcion: '15 reportes nocturnos. Eres los ojos del programa cuando oscurece.', 
        condicion: 15 
      },
      { 
        nivel: 5, 
        nombre: 'El que nunca duerme', 
        icono: '👑', 
        descripcion: '30 reportes de noche. Esperamos que al menos te hayas echado una siesta.', 
        condicion: 30 
      },
    ],
  },
  incomprendido: {
    tipo: 'incomprendido',
    nombre: 'El incomprendido',
    icono: '😔',
    color: '#607D8B',
    colorFondo: '#ECEFF1',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Eso no era un gato', 
        icono: '🥉', 
        descripcion: 'Oops. Pasa en las mejores familias.', 
        condicion: 1 
      },
      { 
        nivel: 2, 
        nombre: 'Necesito lentes', 
        icono: '🥈', 
        descripcion: '3 rechazos. Quizás era una bolsa, quizás era un gato. Nunca lo sabremos.', 
        condicion: 3 
      },
      { 
        nivel: 3, 
        nombre: 'Cazafantasmas', 
        icono: '🥇', 
        descripcion: '7 rechazos. Tu creatividad al reportar no tiene límites.', 
        condicion: 7 
      },
      { 
        nivel: 4, 
        nombre: 'Artista incomprendido', 
        icono: '💎', 
        descripcion: '12 rechazos. En otro universo eres un genio.', 
        condicion: 12 
      },
      { 
        nivel: 5, 
        nombre: 'Leyenda urbana', 
        icono: '👑', 
        descripcion: '20 rechazos. A estas alturas te mereces un trofeo por la dedicación.', 
        condicion: 20 
      },
    ],
  },
  detective: {
    tipo: 'detective',
    nombre: 'Detective',
    icono: '🔍',
    color: '#E65100',
    colorFondo: '#FFF3E0',
    niveles: [
      { 
        nivel: 1, 
        nombre: 'Lo encontré', 
        icono: '🥉', 
        descripcion: '¡Encontraste un gato que andaba perdido! Los responsables de colonia están muy contentos.', 
        condicion: 1 
      },
      { 
        nivel: 2, 
        nombre: 'Rastreador', 
        icono: '🥈', 
        descripcion: '3 gatos encontrados. Tienes instinto para esto.', 
        condicion: 3 
      },
      { 
        nivel: 3, 
        nombre: 'Detective felino', 
        icono: '🥇', 
        descripcion: '6 michis de regreso en el radar gracias a ti.', 
        condicion: 6 
      },
      { 
        nivel: 4, 
        nombre: 'Sabueso del campus', 
        icono: '💎', 
        descripcion: '10 gatos encontrados. Eres el mejor detective de cuatro patas de la UAA.', 
        condicion: 10 
      },
      { 
        nivel: 5, 
        nombre: 'Sherlock Michis', 
        icono: '👑', 
        descripcion: '15 gatos que parecían perdidos para siempre. Ningún michi se pierde con tú en el equipo.', 
        condicion: 15 
      },
    ],
  },
};
