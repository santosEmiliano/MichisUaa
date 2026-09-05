import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, Redirect } from 'expo-router';
import { Pressable, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import WebNavigationBar from '@/components/WebNavigationBar';
import { useAuth } from '@/hooks/useAuth';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isAuthenticated } = useAuth();
  // Se llama antes de cualquier return anticipado: los hooks tienen que
  // ejecutarse siempre en el mismo orden en cada render.
  // Disable the static render of the header on web
  // to prevent a hydration error in React Navigation v6.
  const headerShown = useClientOnlyValue(false, true);

  // Sin este guard, abrir o recargar /mobile/map directo montaba las pestañas
  // sin sesión: la pantalla lanzaba su fetch, recibía 401 y rebotaba al login.
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      tabBar={(props) => <WebNavigationBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Oculta esta pantalla de la barra de pestañas inferior
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          headerShown: false, // Oculta el encabezado nativo
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sighting"
        options={{
          title: 'Avistamiento',
          headerShown: false, // Oculta el encabezado nativo
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false, // Oculta el encabezado nativo
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
