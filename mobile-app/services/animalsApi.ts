import { apiFetch } from './api';

export interface PublicAnimal {
  id: number | string;
  tipo?: string;
  nombre: string;
  foto_url?: string;
}

export const getPublicAnimals = async (): Promise<PublicAnimal[]> => {
  try {
    const response = await apiFetch('/animal/public', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener la lista de gatos públicos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getPublicAnimals:', error);
    throw error;
  }
};
