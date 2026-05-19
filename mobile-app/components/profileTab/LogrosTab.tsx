import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MEDALLAS, TipoMedalla } from '@/constants/medals';

interface LogrosTabProps {
  userMedals?: string[];
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 32 - 24) / 4; // 32 de padding horizontal, 24 de gap total (3 * 8)

export default function LogrosTab({ 
  userMedals = ['primer_avistamiento', 'diez_reportes', 'veinticinco_reportes', 'racha_7_dias'] 
}: LogrosTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const medallasLista = Object.values(MEDALLAS);
  const ganadasSet = new Set(userMedals);
  const ganadasCount = ganadasSet.size;
  const totalCount = medallasLista.length;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Sección: MIS MEDALLAS */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>
          MIS MEDALLAS
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.accentOrange }]}>
          {ganadasCount} de {totalCount}
        </Text>
      </View>

      {/* Cuadrícula de medallas */}
      <View style={styles.gridContainer}>
        {medallasLista.map((medalla) => {
          const ganada = ganadasSet.has(medalla.tipo);

          const cardBg = ganada ? medalla.colorFondo : (colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7');
          const cardBorder = ganada ? medalla.color : (colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea');
          const textColor = ganada ? medalla.color : (colorScheme === 'dark' ? '#8e8e93' : '#aeaeb2');

          return (
            <View 
              key={medalla.tipo} 
              style={[
                styles.medallaCard, 
                { 
                  width: cardWidth,
                  backgroundColor: cardBg, 
                  borderColor: cardBorder,
                  borderWidth: ganada ? 1.5 : 1,
                }
              ]}
            >
              <View style={[styles.iconContainer, !ganada && styles.iconMuted]}>
                <Text style={styles.medallaIcon}>{medalla.icono}</Text>
              </View>
              <Text 
                style={[
                  styles.medallaName, 
                  { color: textColor },
                  !ganada && styles.nameMuted
                ]} 
                numberOfLines={2}
              >
                {medalla.nombre}
              </Text>
            </View>
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
    paddingVertical: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medallaCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 104,
  },
  iconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMuted: {
    opacity: 0.3,
  },
  medallaIcon: {
    fontSize: 26,
  },
  medallaName: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  nameMuted: {
    fontWeight: '600',
  },
});
