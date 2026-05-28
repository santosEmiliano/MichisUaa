import { apiFetch } from './api';

export interface PublicAnimal {
  id: number;
  nombre: string;
  fotoUrl?: string; // Podría llamarse 'foto' o 'fotoUrl' dependiendo del backend
}

export const getPublicAnimals = async (): Promise<PublicAnimal[]> => {
  try {
    const response = await apiFetch('/animals/public', {
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
