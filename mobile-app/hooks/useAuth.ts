import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { getSession, clearSession } from '@/services/sessionStorage';

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

// Hook que gestiona el estado de autenticación de la app.
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await getSession();
        setSession(storedSession);
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
    }
  }, []);

  return {
    isLoading,
    isAuthenticated: session !== null,
    session,
    logout,
  };
}
