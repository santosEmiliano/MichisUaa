import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface RankingCardItem {
  posicion: number;
  nombre: string;
  avistamientosVerificados: number;
  avatarBg: string;
  avatarColor: string;
  isCurrentUser?: boolean;
}

interface RankingCardProps {
  item: RankingCardItem;
  isLast?: boolean;
}

// Obtener iniciales para el avatar
function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function RankingCard({ item, isLast }: RankingCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const rowBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;
  const currentUserBg = colorScheme === 'dark' ? '#3a312a' : '#fff9f0';
  const textColor = colorScheme === 'dark' ? '#ffffff' : '#1a1a1a';
  const posNumberColor = colorScheme === 'dark' ? '#64ced3' : '#2a7a6a';

  return (
    <View 
      style={[
        styles.row,
        item.isCurrentUser && { backgroundColor: currentUserBg },
        !isLast && [styles.borderBottom, { borderBottomColor: rowBorder }]
      ]}
    >
      {/* Barra lateral naranja si es el usuario actual */}
      {item.isCurrentUser && <View style={[styles.activeBar, { backgroundColor: colors.accentOrange }]} />}

      {/* Columna 1: Posición y Avatar */}
      <View style={styles.leftCol}>
        <View style={styles.posContainer}>
          {item.posicion === 1 ? (
            <Text style={styles.medal}>🥇</Text>
          ) : item.posicion === 2 ? (
            <Text style={styles.medal}>🥈</Text>
          ) : item.posicion === 3 ? (
            <Text style={styles.medal}>🥉</Text>
          ) : (
            <Text style={[styles.posNumber, { color: posNumberColor }]}>{item.posicion}</Text>
          )}
        </View>

        <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
          <Text style={[styles.avatarText, { color: item.avatarColor }]}>{getInitials(item.nombre)}</Text>
        </View>
      </View>

      {/* Columna 2: Nombre y Badge "Tú" */}
      <View style={styles.midCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {item.nombre}
          </Text>
          {item.isCurrentUser && (
            <View style={[styles.tuBadge, { backgroundColor: colorScheme === 'dark' ? 'rgba(232, 137, 60, 0.2)' : '#ffe8cc' }]}>
              <Text style={[styles.tuText, { color: colors.accentOrange }]}>Tú</Text>
            </View>
          )}
        </View>
      </View>

      {/* Columna 3: Puntos/Avistamientos */}
      <View style={styles.rightCol}>
        <Text style={[styles.score, { color: textColor }]}>
          {item.avistamientosVerificados}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 84,
    gap: 12,
  },
  posContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal: {
    fontSize: 18,
  },
  posNumber: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  midCol: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  tuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tuText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 50,
  },
  score: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});
