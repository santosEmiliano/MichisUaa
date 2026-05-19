export type TipoMedalla =
  | 'primer_avistamiento'
  | 'diez_reportes'
  | 'veinticinco_reportes'
  | 'cincuenta_reportes'
  | 'racha_7_dias'
  | 'cinco_colonias'
  | 'reporte_nocturno'

export interface MedallaConfig {
  tipo: TipoMedalla;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  colorFondo: string;
}

export const MEDALLAS: Record<TipoMedalla, MedallaConfig> = {
  primer_avistamiento: {
    tipo: 'primer_avistamiento',
    nombre: 'Primer avistamiento',
    descripcion: 'Registraste tu primer avistamiento en el campus',
    icono: '🐾',
    color: '#B86C10',
    colorFondo: '#FEF3E2',
  },
  diez_reportes: {
    tipo: 'diez_reportes',
    nombre: '10 reportes',
    descripcion: 'Acumulaste 10 avistamientos verificados',
    icono: '📍',
    color: '#4A6080',
    colorFondo: '#EEF2F8',
  },
  veinticinco_reportes: {
    tipo: 'veinticinco_reportes',
    nombre: '25 reportes',
    descripcion: 'Acumulaste 25 avistamientos verificados',
    icono: '⭐',
    color: '#004D40',
    colorFondo: '#E0F2F1',
  },
  racha_7_dias: {
    tipo: 'racha_7_dias',
    nombre: 'Racha 7 días',
    descripcion: 'Reportaste avistamientos durante 7 días consecutivos',
    icono: '🔥',
    color: '#B86C10',
    colorFondo: '#FEF3E2',
  },
  cincuenta_reportes: {
    tipo: 'cincuenta_reportes',
    nombre: '50 reportes',
    descripcion: 'Acumulaste 50 avistamientos verificados en la plataforma',
    icono: '🏆',
    color: '#6A1B29',
    colorFondo: '#F9EBEA',
  },
  cinco_colonias: {
    tipo: 'cinco_colonias',
    nombre: '5 colonias',
    descripcion: 'Registraste avistamientos en 5 colonias diferentes del campus',
    icono: '🐱',
    color: '#7D6608',
    colorFondo: '#FEF9E7',
  },
  reporte_nocturno: {
    tipo: 'reporte_nocturno',
    nombre: 'Reporte nocturno',
    descripcion: 'Registraste un avistamiento en horario nocturno',
    icono: '🌙',
    color: '#4A235A',
    colorFondo: '#F4ECF7',
  },
};
