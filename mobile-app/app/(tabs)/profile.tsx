import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getSession } from '@/services/sessionStorage';
import { ProfileHeader, ProfileStats } from '@/components/profileTab';
import TabSelector from '@/components/TabSelector';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState<string>('Ana García');
  const [userEmail, setUserEmail] = useState<string>('usuario@edu.uaa.mx');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Logros');

  useEffect(() => {
    async function loadUserData() {
      try {
        const session = await getSession();
        if (session) {
          if (session.userName) setUserName(session.userName);
          if (session.userEmail) setUserEmail(session.userEmail);
        }
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPanel }]}>
      {loading ? (
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="small" color={colors.accentOrange} />
        </View>
      ) : (
        /* Tarjeta superior del perfil */
        <View style={[styles.topCard, { backgroundColor: colors.bgPanel, paddingTop: insets.top + 24 }]}>
          <ProfileHeader
            userName={userName}
            userEmail={userEmail}
            initials={getInitials(userName)}
          />
          <ProfileStats />
          <TabSelector
            tabs={['Logros', 'Historial', 'Ranking']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>
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
  }
});
