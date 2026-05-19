import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MEDALLAS, MedallaConfig } from '@/constants/medals';

interface LogrosTabProps {
  userMedals?: string[];
  sightingsCount?: number;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 32 - 24) / 4; // 32 de padding horizontal, 24 de gap total (3 * 8)
const slideWidth = width - 32; // Ancho exacto del contenedor para paginación perfecta

function getMedalProgress(medalla: MedallaConfig, sightingsCount: number) {
  let meta = 1;
  let progreso = sightingsCount;
  let label = 'avistamientos';

  switch (medalla.tipo) {
    case 'primer_avistamiento':
      meta = 1;
      progreso = Math.min(sightingsCount, 1);
      label = 'avistamiento';
      break;
    case 'diez_reportes':
      meta = 10;
      progreso = Math.min(sightingsCount, 10);
      label = 'avistamientos';
      break;
    case 'veinticinco_reportes':
      meta = 25;
      progreso = Math.min(sightingsCount, 25);
      label = 'avistamientos';
      break;
    case 'cincuenta_reportes':
      meta = 50;
      progreso = Math.min(sightingsCount, 50);
      label = 'avistamientos';
      break;
    case 'racha_7_dias':
      meta = 7;
      progreso = Math.min(sightingsCount, 7);
      label = 'días consecutivos';
      break;
    case 'cinco_colonias':
      meta = 5;
      progreso = Math.min(sightingsCount, 5);
      label = 'colonias distintas';
      break;
    case 'reporte_nocturno':
      meta = 1;
      progreso = Math.min(sightingsCount, 1);
      label = 'reporte nocturno';
      break;
  }

  const faltan = meta - progreso;
  const porcentaje = Math.min(Math.round((progreso / meta) * 100), 100);

  return { meta, progreso, faltan, porcentaje, label };
}

export default function LogrosTab({ 
  userMedals = ['primer_avistamiento', 'diez_reportes', 'veinticinco_reportes', 'racha_7_dias'],
  sightingsCount = 34
}: LogrosTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [activeIndex, setActiveIndex] = useState(0);

  const medallasLista = Object.values(MEDALLAS);
  const ganadasSet = new Set(userMedals);
  const ganadasCount = ganadasSet.size;
  const totalCount = medallasLista.length;

  const pendientesLista = medallasLista.filter((m) => !ganadasSet.has(m.tipo));

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

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

      {/* Sección: PRÓXIMAS MEDALLAS (Carrusel paginado) */}
      <View style={styles.carouselSection}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain, marginBottom: 16 }]}>
          PRÓXIMAS MEDALLAS
        </Text>

        {pendientesLista.length > 0 ? (
          <View>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            >
              {pendientesLista.map((medalla) => {
                const { meta, progreso, faltan, porcentaje, label } = getMedalProgress(medalla, sightingsCount);
                const cardBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
                const cardBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;

                return (
                  <View key={`progress-${medalla.tipo}`} style={{ width: slideWidth }}>
                    <View 
                      style={[
                        styles.progressCard, 
                        { 
                          backgroundColor: cardBg, 
                          borderColor: cardBorder 
                        }
                      ]}
                    >
                      <View style={styles.progressHeader}>
                        <View style={[styles.progressIconBg, { backgroundColor: medalla.colorFondo }]}>
                          <Text style={styles.progressIconText}>{medalla.icono}</Text>
                        </View>
                        <View style={styles.progressTextCol}>
                          <Text style={[styles.progressTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>
                            Próxima: {medalla.nombre}
                          </Text>
                          <Text style={styles.progressSubtitle}>
                            Te faltan {faltan} {label}
                          </Text>
                        </View>
                      </View>

                      {/* Barra de progreso */}
                      <View style={[styles.progressBarContainer, { backgroundColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea' }]}>
                        <View style={[styles.progressBarFill, { width: `${porcentaje}%`, backgroundColor: medalla.color }]} />
                      </View>

                      <View style={styles.progressNumbersRow}>
                        <Text style={styles.progressNumberText}>{progreso}</Text>
                        <Text style={styles.progressNumberText}>{meta}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Indicadores de paginación (puntos) */}
            {pendientesLista.length > 1 && (
              <View style={styles.paginationContainer}>
                {pendientesLista.map((_, index) => (
                  <View 
                    key={`dot-${index}`} 
                    style={[
                      styles.paginationDot, 
                      activeIndex === index ? [styles.paginationDotActive, { backgroundColor: colors.accentOrange }] : styles.paginationDotInactive
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.progressCard, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#ffffff', borderColor: colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor }]}>
            <View style={styles.progressHeader}>
              <View style={[styles.progressIconBg, { backgroundColor: '#FEF9E7' }]}>
                <Text style={styles.progressIconText}>👑</Text>
              </View>
              <View style={styles.progressTextCol}>
                <Text style={[styles.progressTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>¡Colección Completa!</Text>
                <Text style={[styles.progressSubtitle, { color: colors.accentOrange }]}>Has obtenido todas las medallas disponibles</Text>
              </View>
            </View>
          </View>
        )}
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
  carouselSection: {
    marginTop: 28,
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconText: {
    fontSize: 22,
  },
  progressTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#5ac8fa',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressNumberText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 16,
  },
  paginationDotInactive: {
    backgroundColor: '#8e8e93',
    opacity: 0.4,
  },
});
