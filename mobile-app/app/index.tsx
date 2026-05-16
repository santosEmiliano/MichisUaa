import { Redirect } from 'expo-router';

export default function Index() {
  // Aquí después hay que agregar la lógica para verificar si el usuario ya inició sesión
  // Por ahora, se redirige directamente a la pantalla de login.
  return <Redirect href="/login" />;
}
