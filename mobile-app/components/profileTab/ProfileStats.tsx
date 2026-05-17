import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface StatData {
  value: string;
  label: string;
}

interface ProfileStatsProps {
  stats?: StatData[];
}

const defaultStats: StatData[] = [
  { value: '34', label: 'Avistamientos' },
  { value: '4', label: 'Medallas' },
  { value: '#3', label: 'Ranking' },
];

export default function ProfileStats({ stats = defaultStats }: ProfileStatsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 && (
            <View style={[styles.statDivider, { backgroundColor: colors.borderColor }]} />
          )}
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textMain }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
});
