import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getSession } from '@/services/sessionStorage';
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

  useEffect(() => {
    async function loadProfileData() {
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
  }, []);

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
});
