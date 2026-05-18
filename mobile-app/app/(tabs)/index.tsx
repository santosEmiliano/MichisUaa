// Este componente se encarga de redirigir al usuario a la pantalla del mapa
// Esto porque el _layout.tsx siempre redirige primero a un archivo "index.tsx"
// Si este archivo no existiera, entonces al redirigir a los (tabs) no se encontraría
// ninguna pantalla y se redirigiría a la pantalla de "Not Fount".

import { Redirect } from 'expo-router';

export default function TabsIndex() {
  return <Redirect href="/(tabs)/map" />;
}
