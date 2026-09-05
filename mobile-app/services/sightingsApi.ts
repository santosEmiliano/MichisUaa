import { BASE_URL, refrescarSesion, manejarSesionExpirada } from './api';
import { getSession, COOKIE_SESSION } from './sessionStorage';
import { alertService } from '@/services/alertService';
import { Platform } from 'react-native';

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

  // Se lee la sesión en cada intento para que el reintento posterior a una
  // renovación salga ya con el token nuevo.
  const enviar = async (): Promise<Response> => {
    const actual = await getSession();

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        ...(actual?.token && actual.token !== COOKIE_SESSION ? { Authorization: `Bearer ${actual.token}` } : {}),
        // fetch se encarga de setear el Content-Type multipart/form-data con el boundary correcto
      },
      body: formData,
    };

    if (Platform.OS === 'web') {
      fetchOptions.credentials = 'include';
    }

    return fetch(`${BASE_URL}/avistamientos`, fetchOptions);
  };

  try {
    let response = await enviar();

    if (response.status === 401) {
      // Renovar y reintentar antes de rendirse: si el token vence mientras el
      // usuario llena el formulario, tirar la sesión aquí le hace perder la
      // foto y el reporte completo.
      const renovado = await refrescarSesion();
      if (renovado) {
        response = await enviar();
      }

      if (response.status === 401) {
        await manejarSesionExpirada();
        throw new Error('Unauthorized');
      }
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
