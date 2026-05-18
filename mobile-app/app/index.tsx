import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

// Pantalla inicial de la app (ruta "/").
// Lee la sesión desde SecureStore y redirige al usuario:
//   - Con sesión activa → al mapa
//   - Sin sesión        → al login
export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  // Mientras lee SecureStore no renderiza nada (la splash screen sigue visible)
  if (isLoading) {
    return null;
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/map' : '/login'} />;
}
