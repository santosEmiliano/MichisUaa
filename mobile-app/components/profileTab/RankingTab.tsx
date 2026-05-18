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

// Datos fijos de prueba
const MOCK_RANKINGS = [
  { 
    posicion: 1, 
    nombre: 'Luis Torres', 
    avistamientosVerificados: 58, 
    avatarBg: '#ffffff', 
    avatarColor: '#d35400',
  },
  { 
    posicion: 2, 
    nombre: 'J. Ramírez', 
    avistamientosVerificados: 47, 
    avatarBg: '#ffffff', 
    avatarColor: '#8e44ad',
  },
  { 
    posicion: 3, 
    nombre: 'Ana García', 
    avistamientosVerificados: 34, 
    avatarBg: '#e0f2f1', 
    avatarColor: '#004d40',
  },
  { 
    posicion: 4, 
    nombre: 'S. Méndez', 
    avistamientosVerificados: 29, 
    avatarBg: '#ffffff', 
    avatarColor: '#c0392b',
  },
  { 
    posicion: 5, 
    nombre: 'C. Ríos', 
    avistamientosVerificados: 21, 
    avatarBg: '#ffffff', 
    avatarColor: '#2980b9',
  },
  { 
    posicion: 6, 
    nombre: 'M. Ortega', 
    avistamientosVerificados: 18, 
    avatarBg: '#ffffff', 
    avatarColor: '#8e44ad',
  },
];

function enrichRankings(rankings: RankingItem[], currentUserName?: string) {
  const list = MOCK_RANKINGS;

  return list.map((item) => {
    const isCurrent = Boolean(
      currentUserName && 
      item.nombre.trim().toLowerCase() === currentUserName.trim().toLowerCase()
    );

    return {
      ...item,
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
