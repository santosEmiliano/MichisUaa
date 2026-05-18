import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import RankingCard from './RankingCard';

interface RankingItem {
  posicion: number;
  nombre: string;
  avistamientosVerificados: number;
  avatarBg?: string;
  avatarColor?: string;
  isCurrentUser?: boolean;
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

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

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
  const textColor = colorScheme === 'dark' ? '#ffffff' : '#1a1a1a';

  const numRank = Number(currentUserRanking);
  const isPodium = !isNaN(numRank) && numRank >= 1 && numRank <= 3;

  // Extraer Top 3 para el podio
  const firstPlace = enrichedList[0];
  const secondPlace = enrichedList[1];
  const thirdPlace = enrichedList[2];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Podio superior (Top 3) */}
      <View style={styles.podiumContainer}>
        {/* 2do Lugar (Izquierda) */}
        {secondPlace ? (
          <View style={[styles.podiumCol, { paddingBottom: 0 }]}>
            <View style={[styles.podiumAvatar, { width: 56, height: 56, borderRadius: 28, backgroundColor: secondPlace.avatarBg, borderColor: '#95a5a6', borderWidth: 3 }]}>
              <Text style={[styles.podiumAvatarText, { color: secondPlace.avatarColor, fontSize: 16 }]}>{getInitials(secondPlace.nombre)}</Text>
            </View>
            <Text style={[styles.podiumName, { color: secondPlace.isCurrentUser ? colors.accentOrange : textColor }]} numberOfLines={1}>
              {secondPlace.isCurrentUser ? 'Tú' : secondPlace.nombre}
            </Text>
            <View style={styles.podiumScoreRow}>
              <Text style={[styles.podiumScore, { color: textColor }]}>{secondPlace.avistamientosVerificados}</Text>
              <Text style={styles.podiumPaw}>🐾</Text>
            </View>
            <View style={[styles.podiumStep, styles.stepSecond, { backgroundColor: colorScheme === 'dark' ? '#232325' : '#f1f2f6', borderColor: colorScheme === 'dark' ? '#575759' : '#ced6e0' }]}>
              <Text style={styles.podiumMedalText}>🥈</Text>
            </View>
          </View>
        ) : <View style={styles.podiumCol} />}

        {/* 1er Lugar (Centro) */}
        {firstPlace ? (
          <View style={[styles.podiumCol, styles.firstPlaceCol]}>
            <View style={[styles.podiumAvatar, { width: 68, height: 68, borderRadius: 34, backgroundColor: firstPlace.avatarBg, borderColor: '#f39c12', borderWidth: 3 }]}>
              <Text style={[styles.podiumAvatarText, { color: firstPlace.avatarColor, fontSize: 20 }]}>{getInitials(firstPlace.nombre)}</Text>
            </View>
            <Text style={[styles.podiumName, styles.firstPlaceName, { color: firstPlace.isCurrentUser ? colors.accentOrange : textColor }]} numberOfLines={1}>
              {firstPlace.isCurrentUser ? 'Tú' : firstPlace.nombre}
            </Text>
            <View style={styles.podiumScoreRow}>
              <Text style={[styles.podiumScore, { color: textColor }]}>{firstPlace.avistamientosVerificados}</Text>
              <Text style={styles.podiumPaw}>🐾</Text>
            </View>
            <View style={[styles.podiumStep, styles.stepFirst, { backgroundColor: colorScheme === 'dark' ? '#3a2818' : '#fef9e7', borderColor: '#f39c12' }]}>
              <Text style={styles.podiumMedalText}>🥇</Text>
            </View>
          </View>
        ) : <View style={[styles.podiumCol, styles.firstPlaceCol]} />}

        {/* 3er Lugar (Derecha) */}
        {thirdPlace ? (
          <View style={[styles.podiumCol, { paddingBottom: 0 }]}>
            <View style={[styles.podiumAvatar, { width: 56, height: 56, borderRadius: 28, backgroundColor: thirdPlace.avatarBg, borderColor: '#d35400', borderWidth: 3 }]}>
              <Text style={[styles.podiumAvatarText, { color: thirdPlace.avatarColor, fontSize: 16 }]}>{getInitials(thirdPlace.nombre)}</Text>
            </View>
            <Text style={[styles.podiumName, { color: thirdPlace.isCurrentUser ? colors.accentOrange : textColor }]} numberOfLines={1}>
              {thirdPlace.isCurrentUser ? 'Tú' : thirdPlace.nombre}
            </Text>
            <View style={styles.podiumScoreRow}>
              <Text style={[styles.podiumScore, { color: textColor }]}>{thirdPlace.avistamientosVerificados}</Text>
              <Text style={styles.podiumPaw}>🐾</Text>
            </View>
            <View style={[styles.podiumStep, styles.stepThird, { backgroundColor: colorScheme === 'dark' ? '#33251c' : '#fbeee6', borderColor: colorScheme === 'dark' ? '#8d6e63' : '#e67e22' }]}>
              <Text style={styles.podiumMedalText}>🥉</Text>
            </View>
          </View>
        ) : <View style={styles.podiumCol} />}
      </View>

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
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 24,
    paddingTop: 16,
  },
  podiumCol: {
    alignItems: 'center',
    width: 96,
  },
  firstPlaceCol: {
    width: 108,
    zIndex: 2,
  },
  podiumAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  podiumAvatarText: {
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 14,
  },
  podiumScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  podiumPaw: {
    fontSize: 12,
  },
  podiumStep: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  stepFirst: {
    height: 100,
  },
  stepSecond: {
    height: 76,
  },
  stepThird: {
    height: 56,
  },
  podiumMedalText: {
    fontSize: 24,
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
