import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import RankingCard from './RankingCard';

interface RankingItem {
  posicion: number;
  nombre: string;
  avistamientosVerificados: number;
}

interface RankingTabProps {
  rankings: RankingItem[];
  currentUserName?: string;
  currentUserRanking?: string | number;
  totalUsersCount?: number;
}

// Paletas de colores para los avatares
const AVATAR_PALETTES = [
  { bg: '#ffffff', color: '#d35400' }, // Naranja oscuro
  { bg: '#ffffff', color: '#8e44ad' }, // Morado
  { bg: '#ffffff', color: '#c0392b' }, // Rojo oscuro
  { bg: '#ffffff', color: '#2980b9' }, // Azul oscuro
  { bg: '#ffffff', color: '#16a085' }, // Verde cerceta
  { bg: '#ffffff', color: '#d68910' }, // Oro
];

function enrichRankings(rankings: RankingItem[], currentUserName?: string) {
  if (!rankings || rankings.length === 0) return [];

  return rankings.map((item, index) => {
    const isCurrent = Boolean(
      currentUserName && 
      item.nombre.trim().toLowerCase() === currentUserName.trim().toLowerCase()
    );

    // Si es el usuario actual, usar la combinación cyan para distinguirlo
    const avatarBg = isCurrent ? '#e0f2f1' : AVATAR_PALETTES[index % AVATAR_PALETTES.length].bg;
    const avatarColor = isCurrent ? '#004d40' : AVATAR_PALETTES[index % AVATAR_PALETTES.length].color;

    return {
      ...item,
      avatarBg,
      avatarColor,
      isCurrentUser: isCurrent,
    };
  });
}

export default function RankingTab({ 
  rankings, 
  currentUserName, 
  currentUserRanking = '--', 
  totalUsersCount = 0 
}: RankingTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const enrichedList = enrichRankings(rankings, currentUserName);

  // Colores de los componentes
  const cardBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
  const cardBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;
  const labelColor = colorScheme === 'dark' ? '#d1d1d6' : colors.textSecondary;
  const valueColor = colorScheme === 'dark' ? '#ffffff' : colors.textMain;

  const numRank = Number(currentUserRanking);
  const isPodium = !isNaN(numRank) && numRank >= 1 && numRank <= 3;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Tarjeta de "Tu posición actual" */}
      <View style={[styles.topCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={[styles.activeBar, { backgroundColor: colors.accentOrange }]} />

        <View style={styles.topCardLeft}>
          <View style={styles.topMedalContainer}>
            {isPodium ? (
              <Text style={styles.topMedal}>
                {numRank === 1 ? '🥇' : numRank === 2 ? '🥈' : '🥉'}
              </Text>
            ) : (
              <Text style={styles.topMedal}>🐾</Text>
            )}
          </View>
          <Text style={[styles.topCardLabel, { color: labelColor }]}>
            Tu{'\n'}posición{'\n'}actual
          </Text>
        </View>

        <View style={styles.topCardRight}>
          <Text style={[styles.topCardValue, { color: valueColor }]}>
            #{currentUserRanking} de {totalUsersCount} usuarios
          </Text>
        </View>
      </View>

      {/* Tarjeta principal del listado de ranking */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {enrichedList.map((item, index) => {
          const isLast = index === enrichedList.length - 1;
          return (
            <RankingCard 
              key={`${item.posicion}-${item.nombre}`} 
              item={item} 
              isLast={isLast} 
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  topCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: 'relative',
    minHeight: 76,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  topCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  topMedalContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMedal: {
    fontSize: 20,
  },
  topCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  topCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  topCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
