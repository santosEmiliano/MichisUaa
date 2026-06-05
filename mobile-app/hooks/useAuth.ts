import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { getSession, clearSession } from '@/services/sessionStorage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiFetch } from '@/services/api';
import { showAlert } from '@/utils/alerts';
import Constants, { ExecutionEnvironment } from 'expo-constants';

interface Session {
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
}

interface UseAuthReturn {
  //Se encarga de verificar si hay una sesión activa guardada
  isLoading: boolean;

  //Verifica si hay una sesión activa guardada
  isAuthenticated: boolean;

  //Guarda la información de la sesión activa, o null si no hay sesión
  session: Session | null;

  //Cierra la sesión y redirige al login
  logout: () => Promise<void>;
}

export const registrarPushToken = async () => {
  if (Platform.OS === 'web') return;

  // Evitar error en Expo Go en SDK 53+
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (isExpoGo) {
    console.warn(
      'Las notificaciones push (remote) no son soportadas en Expo Go en SDK 53+. ' +
      'Usa una compilación de desarrollo (development build) si necesitas probarlas.'
    );
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones denegado.');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e8893c',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('No se encontró el projectId de EAS.');
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('\n====================================');
    console.log('PUSH TOKEN:', token.data);
    console.log('====================================\n');
    // Mandas el token al backend para guardarlo
    await apiFetch('/user/push-token', {
      method: 'PUT',
      body: JSON.stringify({ token: token.data }),
    });
  } catch (error) {
    console.error('Error al registrar push token:', error);
  }
};

// Hook que gestiona el estado de autenticación de la app.
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await getSession();
        setSession(storedSession);
        if (storedSession) {
          // Registrar token de notificaciones si la sesión es válida al iniciar
          registrarPushToken();
        }
      } catch (error) {
        console.error('Error al leer la sesión:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Hook que cierra la sesión y redirige al login
  const logout = useCallback(async () => {
    try {
      await clearSession();
      setSession(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showAlert('Error', 'Hubo un problema al cerrar sesión.');
    }
  }, []);

  return {
    isLoading,
    isAuthenticated: session !== null,
    session,
    logout,
  };
}
