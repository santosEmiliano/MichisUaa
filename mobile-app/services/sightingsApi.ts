import { BASE_URL } from './api';
import { getSession, clearSession } from './sessionStorage';
import { router } from 'expo-router';
import { alertService } from '@/services/alertService';
import { Platform } from 'react-native';

let isNavigatingToLogin = false;

interface SightingData {
  latitud: number;
  longitud: number;
  animalId?: number | null;
  descripcion?: string;
  fotoUri: string;
}

export const createSighting = async (data: SightingData) => {
  const session = await getSession();

  if (!session) {
    throw new Error('No hay sesión activa');
  }

  const formData = new FormData();
  
  formData.append('usuarioId', session.userId);
  formData.append('latitud', String(data.latitud));
  formData.append('longitud', String(data.longitud));
  
  if (data.animalId) {
    formData.append('animalId', String(data.animalId));
  }
  
  if (data.descripcion) {
    formData.append('descripcion', data.descripcion);
  }

  // Parse filename and type
  let filename = data.fotoUri.split('/').pop() || 'photo.jpg';
  if (Platform.OS === 'web' || filename.includes(';') || !filename.includes('.')) {
    filename = 'photo.jpg';
  }
  
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(data.fotoUri);
      const blob = await response.blob();
      formData.append('foto', blob, filename);
    } catch (error) {
      console.error('Error procesando imagen para web:', error);
      formData.append('foto', {
        uri: data.fotoUri,
        name: filename,
        type,
      } as any);
    }
  } else {
    formData.append('foto', {
      uri: Platform.OS === 'android' ? data.fotoUri : data.fotoUri.replace('file://', ''),
      name: filename,
      type,
    } as any);
  }

  try {
    const response = await fetch(`${BASE_URL}/avistamientos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        // fetch se encarga de setear el Content-Type multipart/form-data con el boundary correcto
      },
      body: formData,
    });

    if (response.status === 401) {
      if (!isNavigatingToLogin) {
        isNavigatingToLogin = true;
        await clearSession();
        alertService.error("Sesión expirada", "Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo.");
        router.replace("/login");

        setTimeout(() => {
          isNavigatingToLogin = false;
        }, 2000);
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error del servidor:', errText);
      throw new Error('Error al enviar el avistamiento');
    }

    return await response.json();
  } catch (error: any) {
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      alertService.error("Error de Servidor", "No pudimos comunicarnos con el servidor de MichisUAA. Por favor, verifica tu conexión a internet o intenta más tarde.");
    }
    console.error('Error creating sighting:', error);
    throw error;
  }
};
