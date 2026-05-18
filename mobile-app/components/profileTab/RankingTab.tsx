import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

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

export default function RankingTab({ rankings, currentUserName }: RankingTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const enrichedList = enrichRankings(rankings, currentUserName);

  // Colores de los componentes
  const cardBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
  const cardBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
