// Componente de la tarjeta que dice "Tu posición actual"

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CurrentUserRankingCardProps {
  currentUserRanking?: string | number;
  totalUsersCount?: number;
}

export default function CurrentUserRankingCard({ 
  currentUserRanking = '--', 
  totalUsersCount = 0 
}: CurrentUserRankingCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
  const cardBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;
  const labelColor = colorScheme === 'dark' ? '#d1d1d6' : colors.textSecondary;
  const valueColor = colorScheme === 'dark' ? '#ffffff' : colors.textMain;

  const numRank = Number(currentUserRanking);
  const isPodium = !isNaN(numRank) && numRank >= 1 && numRank <= 3;

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
