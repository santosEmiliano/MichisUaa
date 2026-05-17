import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme, setColorScheme } from '@/components/useColorScheme';
import { getSession } from '@/services/sessionStorage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState<string>('Ana García');
  const [userEmail, setUserEmail] = useState<string>('usuario@edu.uaa.mx');
  const [loading, setLoading] = useState<boolean>(true);

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
    if (!name) return '??'; // iniciales que se ponen por default si no hay nombre
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Alternar entre modo claro y oscuro a nivel de la aplicación
  const toggleTheme = () => {
    const nextScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(nextScheme);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgDark, paddingTop: insets.top }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accentOrange} />
        </View>
      ) : (
        /* Parte superior del perfil (Header) */
        <View style={[styles.headerContainer, { backgroundColor: colors.bgPanel }]}>
          {/* Grupo izquierdo: Avatar e Información */}
          <View style={styles.profileGroup}>
            {/* Contenedor del Avatar con Orejitas de Gato */}
            <View style={styles.avatarWrapper}>
              {/* Oreja Izquierda */}
              <View style={[styles.catEar, styles.leftEar, { backgroundColor: colors.accentOrange }]}>
                <View style={styles.innerEar} />
              </View>
              {/* Oreja Derecha */}
              <View style={[styles.catEar, styles.rightEar, { backgroundColor: colors.accentOrange }]}>
                <View style={styles.innerEar} />
              </View>
              {/* Círculo Principal del Avatar */}
              <View style={[styles.avatar, { backgroundColor: colors.accentOrange }]}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>
            </View>

            <View style={styles.infoColumn}>
              <Text style={[styles.userName, { color: colors.textMain }]}>
                {userName}
              </Text>
              <View style={styles.roleRow}>
                <View style={[styles.roleDot, { backgroundColor: colors.metricaVerde }]} />
                <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Botón derecho: Ícono para cambiar tema */}
          <TouchableOpacity 
            style={[
              styles.sunButton, 
              { backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro }
            ]}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
              size={22} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  catEar: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1, // orden de capas en Android
  },
  leftEar: {
    top: -3,
    left: 6,
    transform: [{ rotate: '25deg' }],
  },
  rightEar: {
    top: -3,
    right: 6,
    transform: [{ rotate: '65deg' }],
  },
  innerEar: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoColumn: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sunButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
