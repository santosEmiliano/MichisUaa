// Componente del podio superior (Top 3)

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface RankingItem {
  posicion: number;
  nombre: string;
  avistamientosVerificados: number;
  avatarBg?: string;
  avatarColor?: string;
  isCurrentUser?: boolean;
}

interface RankingPodiumProps {
  topRankings: RankingItem[];
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function RankingPodium({ topRankings }: RankingPodiumProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const textColor = colorScheme === 'dark' ? '#ffffff' : '#1a1a1a';

  // Extraer Top 3 para el podio
  const firstPlace = topRankings[0];
  const secondPlace = topRankings[1];
  const thirdPlace = topRankings[2];

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
