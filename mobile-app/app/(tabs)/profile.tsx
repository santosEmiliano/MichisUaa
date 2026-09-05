import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Alert, Platform, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { alertService } from '@/services/alertService';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getSession, clearSession } from '@/services/sessionStorage';
import { getSightingsByUser, getUserRanking, getUserMedals } from '@/services/profileApi';
import { getTopRankings } from '@/services/rankings';
import { ProfileHeader, SightingHistoryTab, RankingTab, LogrosTab } from '@/components/profileTab';
import TabSelector from '@/components/TabSelector';

const CatLoader = ({ color }: { color: string }) => {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad)
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.bounce
        }),
        Animated.delay(1000)
      ])
    ).start();
  }, [bounceAnim]);

  return (
    <Animated.View style={{ transform: [{ translateY: bounceAnim }], marginBottom: 16 }}>
      <MaterialCommunityIcons name="cat" size={54} color={color} />
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Logros');
  const [sightingsCount, setSightingsCount] = useState<number>(0);
  const [sightings, setSightings] = useState<any[]>([]);
  const [rankingPosition, setRankingPosition] = useState<string | number>('--');
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [topRankings, setTopRankings] = useState<any[]>([]);
  const [userMedals, setUserMedals] = useState<{ tipo: string; nivel: number }[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const session = await getSession();
          if (session) {
            if (session.userName) setUserName(session.userName);
            if (session.userEmail) setUserEmail(session.userEmail);

            if (session.userId) {
              const [rankData, medalsData] = await Promise.all([
                getUserRanking(session.userId),
                getUserMedals(session.userId)
              ]);

              if (rankData?.posicion) {
                setRankingPosition(rankData.posicion);
                if (rankData.totalUsuarios) setTotalUsersCount(rankData.totalUsuarios);
              } else {
                setRankingPosition('--');
                if (rankData?.totalUsuarios) setTotalUsersCount(rankData.totalUsuarios);
              }

              if (Array.isArray(medalsData)) {
                setUserMedals(medalsData.map((m: any) => ({ 
                  tipo: m.tipo, 
                  nivel: typeof m.nivel === 'number' ? m.nivel : 1 
                })));
              }
            }
          }

          const [sightingsData, rankingsData] = await Promise.all([
            getSightingsByUser(),
            getTopRankings(),
          ]);

          if (Array.isArray(sightingsData)) {
            setSightings(sightingsData);
            setSightingsCount(sightingsData.length);
          }

          if (Array.isArray(rankingsData)) {
            setTopRankings(rankingsData);
          }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
        alertService.error("Error", "No pudimos cargar tu perfil completo. Verifica tu conexión e intenta más tarde.");
      } finally {
        if (!isRefresh) setLoading(false);
        else setRefreshing(false);
      }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const performLogout = async () => {
    try {
      await clearSession();
      alertService.success("Sesión cerrada", "Has cerrado sesión exitosamente.");
      router.replace('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alertService.error("Error", "No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };

  const handleLogout = async () => {
    const confirm = await alertService.questionAsync(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      "Cerrar sesión",
      "Cancelar"
    );
    if (confirm) {
      performLogout();
    }
  };

  // Renderizar contenido según el tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Historial':
        return <SightingHistoryTab sightings={sightings} onRefresh={() => loadProfileData(true)} refreshing={refreshing} />;
      case 'Ranking':
        return (
          <RankingTab 
            rankings={topRankings} 
            currentUserName={userName} 
            currentUserRanking={rankingPosition}
            totalUsersCount={totalUsersCount}
            onRefresh={() => loadProfileData(true)} 
            refreshing={refreshing}
          />
        );
      case 'Logros':
        return <LogrosTab userMedals={userMedals} sightingsCount={sightingsCount} sightings={sightings} onRefresh={() => loadProfileData(true)} refreshing={refreshing} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgDark }]}>
      {loading ? (
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom + 50 }]}>
          <CatLoader color={colors.accentOrange} />
          <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '500' }}>
            Preguntándole a los gatos sobre ti...
          </Text>
        </View>
      ) : (
        <>
          {/* Tarjeta superior del perfil */}
          <View style={[styles.topCard, { backgroundColor: colors.bgPanel, paddingTop: insets.top + 24 }]}>
            <ProfileHeader
              userName={userName}
              userEmail={userEmail}
              initials={getInitials(userName)}
              onLogout={handleLogout}
              onRefresh={() => loadProfileData(true)}
              isRefreshing={refreshing}
            />
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
    flex: 1,
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
