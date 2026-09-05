/**
 * Configuración geográfica y de zoom del mapa.
 *
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

// Bounding box real del campus central.
export const UAA_BOUNDS = {
  minLatitude: 21.9094964,
  maxLatitude: 21.9188114,
  minLongitude: -102.3225234,
  maxLongitude: -102.3110796,
} as const;

const CAMPUS_LATITUDE_SPAN = UAA_BOUNDS.maxLatitude - UAA_BOUNDS.minLatitude;
const CAMPUS_LONGITUDE_SPAN = UAA_BOUNDS.maxLongitude - UAA_BOUNDS.minLongitude;

// Margen sobre el bbox para que la barra de búsqueda y la leyenda no tapen las orillas del campus cuando se encuadra completo.
const CAMPUS_PADDING = 1.25;

/**
 * Encuadre "campus completo": ni tan lejos que la UAA se pierda entre la ciudad,
 * ni tan cerca que se corten los avistamientos de las orillas.
 */
export const UAA_REGION: MapRegion = {
  latitude: (UAA_BOUNDS.minLatitude + UAA_BOUNDS.maxLatitude) / 2,
  longitude: (UAA_BOUNDS.minLongitude + UAA_BOUNDS.maxLongitude) / 2,
  latitudeDelta: CAMPUS_LATITUDE_SPAN * CAMPUS_PADDING,
  longitudeDelta: CAMPUS_LONGITUDE_SPAN * CAMPUS_PADDING,
};

/** Topes de zoom. Se le pasan al MapView nativo y al shim web para que las tres
 * plataformas topen exactamente en el mismo punto. */
export const MIN_ZOOM_LEVEL = 14;
export const MAX_ZOOM_LEVEL = 19;

/** Cuánto zoom mueve cada toque de los botones: un nivel, igual que Google Maps. */
export const ZOOM_LEVEL_STEP = 1;

/** Holgura al comparar contra los topes, para absorber el redondeo del mapa. */
const ZOOM_EPSILON = 0.05;

/**
 * Qué tan lejos del centro del campus hay que estar para ofrecer el botón de
 * recentrar.
 */
export const RECENTER_DISTANCE_THRESHOLD = 0.005;

/**
 * Tolerancia de zoom, en niveles, antes de ofrecer recentrar. 
 */
export const RECENTER_ZOOM_TOLERANCE = 0.8;

/** Limita un valor a un rango cerrado. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const TILE_SIZE = 256;

/** Proyección Y de Web Mercator, en radianes. */
export const mercatorY = (latitude: number): number =>
  Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360));

const inverseMercatorY = (y: number): number =>
  ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;

/**
 * Nivel de zoom que hace caber una región entera en un contenedor de
 * `width` x `height` píxeles.
 */
export const zoomLevelForRegion = (
  region: MapRegion,
  width: number,
  height: number
): number => {
  const zoomForWidth = Math.log2((360 * width) / (TILE_SIZE * region.longitudeDelta));

  const north = region.latitude + region.latitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const mercatorSpan = mercatorY(north) - mercatorY(south);
  const zoomForHeight = Math.log2((2 * Math.PI * height) / (TILE_SIZE * mercatorSpan));

  return Math.min(zoomForWidth, zoomForHeight);
};

/** Región visible en un contenedor de `width` x `height` a un nivel de zoom dado. */
export const regionForZoomLevel = (
  center: LatLng,
  zoomLevel: number,
  width: number,
  height: number
): MapRegion => {
  const scale = TILE_SIZE * Math.pow(2, zoomLevel);
  const longitudeDelta = (360 * width) / scale;

  const mercatorSpan = (2 * Math.PI * height) / scale;
  const centerY = mercatorY(center.latitude);
  const latitudeDelta =
    inverseMercatorY(centerY + mercatorSpan / 2) -
    inverseMercatorY(centerY - mercatorSpan / 2);

  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

/** Región resultante de mover `levels` niveles de zoom, respetando los topes. */
export const regionAfterZoom = (
  region: MapRegion,
  levels: number,
  width: number,
  height: number
): MapRegion => {
  const current = zoomLevelForRegion(region, width, height);
  const next = clamp(current + levels, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL);
  return regionForZoomLevel(region, next, width, height);
};

/** ¿Queda margen para seguir acercando/alejando con los botones? */
export const canZoom = (
  region: MapRegion,
  levels: number,
  width: number,
  height: number
): boolean => {
  const current = zoomLevelForRegion(region, width, height);
  return levels > 0
    ? current < MAX_ZOOM_LEVEL - ZOOM_EPSILON
    : current > MIN_ZOOM_LEVEL + ZOOM_EPSILON;
};
