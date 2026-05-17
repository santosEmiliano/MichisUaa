import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getSession, clearSession } from '@/services/sessionStorage';
import { getSightingsByUser } from '@/services/profileApi';
import { ProfileHeader, ProfileStats, SightingHistoryTab } from '@/components/profileTab';
import TabSelector from '@/components/TabSelector';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState<string>('Ana García');
  const [userEmail, setUserEmail] = useState<string>('usuario@edu.uaa.mx');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Logros');
  const [sightingsCount, setSightingsCount] = useState<number>(0);
  const [sightings, setSightings] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadProfileData() {
        setLoading(true);
        try {
          const session = await getSession();
          if (session) {
            if (session.userName) setUserName(session.userName);
            if (session.userEmail) setUserEmail(session.userEmail);
          }

          const data = await getSightingsByUser();
          if (Array.isArray(data)) {
            setSightings(data);
            setSightingsCount(data.length);
          }
        } catch (error) {
          console.error("Error al cargar datos del perfil:", error);
        } finally {
          setLoading(false);
        }
      }
      loadProfileData();
    }, [])
  );

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Estadísticas del perfil
  const profileStats = [
    { value: String(sightingsCount), label: 'Avistamientos' },
    { value: '0', label: 'Medallas' },
    { value: '#--', label: 'Ranking' },
  ];

  const performLogout = async () => {
    try {
      await clearSession();
      router.replace('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: performLogout,
          },
        ]
      );
    }
  };

  // Renderizar contenido según el tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Historial':
        return <SightingHistoryTab sightings={sightings} />;
      case 'Logros':
      case 'Ranking':
      default:
        return null;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgDark }]}>
      {loading ? (
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="small" color={colors.accentOrange} />
        </View>
      ) : (
        <>
          {/* Tarjeta superior del perfil */}
          <View style={[styles.topCard, { backgroundColor: colors.bgPanel, paddingTop: insets.top + 24 }]}>
            <ProfileHeader
              userName={userName}
              userEmail={userEmail}
              initials={getInitials(userName)}
            />
            <ProfileStats stats={profileStats} />
            <TabSelector
              tabs={['Logros', 'Historial', 'Ranking']}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          {/* Contenido del tab seleccionado */}
          {renderTabContent()}

          {/* Botón de Cerrar Sesión al final de la pantalla */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#c0392b" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCard: {
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(192, 57, 43, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.28)',
    gap: 8,
  },
  logoutText: {
    color: '#c0392b',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
