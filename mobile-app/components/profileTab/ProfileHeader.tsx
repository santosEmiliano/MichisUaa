import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme, setColorScheme } from '@/components/useColorScheme';
import CatAvatar from './CatAvatar';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  initials: string;
}

export default function ProfileHeader({ userName, userEmail, initials }: ProfileHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const toggleTheme = () => {
    const nextScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(nextScheme);
  };

  return (
    <View style={styles.headerRow}>
      {/* Grupo izquierdo: Avatar e Información */}
      <View style={styles.profileGroup}>
        <CatAvatar initials={initials} />

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
          styles.themeButton,
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
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
