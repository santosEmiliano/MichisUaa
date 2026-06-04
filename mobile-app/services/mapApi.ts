import { apiFetch } from './api';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface AnimalPublic {
  id: number | string;
  nombre: string;
  estado: string;
  foto_url: string | null;
  colonia: string;
  coordenadas: Coordenadas | null;
}

// Se obtiene la lista pública de animales con su último avistamiento.
export const getPublicAnimals = async (): Promise<AnimalPublic[]> => {
  try {
    const response = await apiFetch('/animal/public');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: AnimalPublic[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener animales públicos:', error);
    throw error;
  }
};
