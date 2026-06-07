import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions, RefreshControl } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MEDALLAS, MedallaConfig } from '@/constants/medals';

interface LogrosTabProps {
  userMedals?: { tipo: string; nivel: number }[];
  sightingsCount?: number;
  sightings?: any[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

// Helper to get theme-appropriate colors for dark mode high-contrast and light mode
function getCategoryColors(tipo: string, colorScheme: 'light' | 'dark', baseColor: string, baseColorFondo: string) {
  if (colorScheme === 'light') {
    return { color: baseColor, colorFondo: baseColorFondo };
  }

  // Solid premium high-contrast colors to avoid Android composite rendering bugs with transparency
  switch (tipo) {
    case 'avistamientos':
      return { color: '#FFB74D', colorFondo: '#2d251a' }; 
    case 'verificados':
      return { color: '#4DB6AC', colorFondo: '#152926' }; 
    case 'racha':
      return { color: '#9FA8DA', colorFondo: '#1f2238' }; 
    case 'colonias':
      return { color: '#64B5F6', colorFondo: '#162638' }; 
    case 'favorito':
      return { color: '#F06292', colorFondo: '#311925' }; 
    case 'nocturno':
      return { color: '#7986CB', colorFondo: '#1e2035' };
    case 'incomprendido':
      return { color: '#B0BEC5', colorFondo: '#242a2d' };
    case 'detective':
      return { color: '#FF8A65', colorFondo: '#33211b' };
    default:
      return { color: baseColor, colorFondo: baseColorFondo };
  }
}

function calculateRacha(sightings: any[]): number {
  if (!Array.isArray(sightings) || sightings.length === 0) return 0;
  
  const fechasUnicas = [...new Set(sightings.map(a => {
    const date = new Date(a.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (fechasUnicas.length === 0) return 0;

  let maxRacha = 1;
  let rachaActual = 1;

  for (let i = 0; i < fechasUnicas.length - 1; i++) {
    const fechaActual = new Date(fechasUnicas[i]);
    const fechaAnterior = new Date(fechasUnicas[i + 1]);
    const diffTime = Math.abs(fechaActual.getTime() - fechaAnterior.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      rachaActual++;
      if (rachaActual > maxRacha) {
        maxRacha = rachaActual;
      }
    } else if (diffDays > 1) {
      rachaActual = 1;
    }
  }
  return maxRacha;
}

function getCategoryProgressValue(tipo: string, sightings: any[], sightingsCount: number): number {
  if (!Array.isArray(sightings)) return 0;
  
  switch (tipo) {
    case 'avistamientos':
      return sightingsCount || sightings.length;
    case 'verificados':
      return sightings.filter(s => s.verificado).length;
    case 'racha':
      return calculateRacha(sightings);
    case 'colonias':
      return new Set(
        sightings
          .filter(s => s.animalId !== null && s.animal?.Colonia_idColonia !== undefined)
          .map(s => s.animal.Colonia_idColonia)
      ).size;
    case 'favorito': {
      const counts: Record<number, number> = {};
      sightings.forEach(s => {
        if (s.animalId) {
          counts[s.animalId] = (counts[s.animalId] || 0) + 1;
        }
      });
      return Object.values(counts).reduce((a, b) => Math.max(a, b), 0);
    }
    case 'nocturno':
      return sightings.filter(s => {
        const date = new Date(s.createdAt);
        const hour = date.getHours();
        return hour >= 21 || hour <= 5;
      }).length;
    case 'incomprendido':
      return sightings.filter(s => s.verificado === false && s.verificadoPor !== null).length;
    case 'detective':
      return sightings.filter(s => s.animal?.estado === 'Desaparecido').length;
    default:
      return 0;
  }
}

function getCategoryState(medalla: MedallaConfig, userLevel: number, progressValue: number) {
  const currentNivelConfig = medalla.niveles.find(n => n.nivel === userLevel);
  const nextNivelConfig = medalla.niveles.find(n => n.nivel === userLevel + 1);

  const isCompleted = userLevel === 5;
  const currentLevelName = currentNivelConfig ? currentNivelConfig.nombre : 'Sin iniciar';
  const nextLevelName = nextNivelConfig ? nextNivelConfig.nombre : '';

  let label = '';
  switch (medalla.tipo) {
    case 'avistamientos': label = 'avistamientos'; break;
    case 'verificados': label = 'verificados'; break;
    case 'racha': label = 'días seguidos'; break;
    case 'colonias': label = 'colonias distintas'; break;
    case 'favorito': label = 'reportes del mismo gato'; break;
    case 'nocturno': label = 'reportes nocturnos'; break;
    case 'incomprendido': label = 'reportes rechazados'; break;
    case 'detective': label = 'gatos desaparecidos reportados'; break;
  }

  if (isCompleted) {
    const meta = medalla.niveles[4].condicion;
    return {
      userLevel,
      currentLevelName,
      nextLevelName: '¡Completado!',
      progreso: progressValue,
      meta,
      porcentaje: 100,
      label,
      isCompleted: true,
      nextConditionText: '¡Has alcanzado el nivel máximo!'
    };
  }

  const meta = nextNivelConfig ? nextNivelConfig.condicion : 1;
  const progreso = progressValue;
  const porcentaje = Math.min(Math.round((progreso / meta) * 100), 100);
  const nextConditionText = nextNivelConfig ? `Siguiente: ${nextNivelConfig.condicion} ${label}` : '';

  return {
    userLevel,
    currentLevelName,
    nextLevelName,
    progreso,
    meta,
    porcentaje,
    label,
    isCompleted: false,
    nextConditionText
  };
}

export default function LogrosTab({ 
  userMedals = [],
  sightingsCount = 0,
  sightings = [],
  onRefresh,
  refreshing = false
}: LogrosTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollViewRef = useRef<ScrollView>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedNivelMap, setSelectedNivelMap] = useState<Record<string, number>>({});

  const medallasLista = Object.values(MEDALLAS);
  const totalCategorias = medallasLista.length;

  const medalLevelMap = new Map<string, number>();
  if (Array.isArray(userMedals)) {
    userMedals.forEach(m => {
      medalLevelMap.set(m.tipo, m.nivel);
    });
  }

  const activeMedalla = medallasLista[activeIndex];

  const { width } = useWindowDimensions();
  const paddingHorizontal = 16;
  const slideWidth = width - (paddingHorizontal * 2);
  const gap = 8;
  const cardWidth = (slideWidth - (gap * 3)) / 4;

  const itemsPerSlide = width >= 1024 ? 4 : (width >= 768 ? 2 : 1);
  const totalSlides = Math.ceil(totalCategorias / itemsPerSlide);

  const carouselSlides = [];
  for (let i = 0; i < totalCategorias; i += itemsPerSlide) {
    carouselSlides.push(medallasLista.slice(i, i + itemsPerSlide));
  }

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    const newCategoryIndex = slideIndex * itemsPerSlide;
    if (newCategoryIndex >= 0 && newCategoryIndex < totalCategorias && Math.floor(activeIndex / itemsPerSlide) !== slideIndex) {
      setActiveIndex(newCategoryIndex);
    }
  };

  const handleCategoryPress = (index: number) => {
    setActiveIndex(index);
    const slideIndex = Math.floor(index / itemsPerSlide);
    scrollViewRef.current?.scrollTo({ x: slideIndex * slideWidth, animated: true });
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accentOrange]} tintColor={colors.accentOrange} /> : undefined
      }
    >
      {/* Sección: CATEGORÍAS */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>
          CATEGORÍAS DE LOGROS
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.accentOrange }]}>
          {medalLevelMap.size} de {totalCategorias} iniciadas
        </Text>
      </View>

      {/* Cuadrícula de categorías */}
      <View style={styles.gridContainer}>
        {medallasLista.map((medalla, index) => {
          const userLevel = medalLevelMap.get(medalla.tipo) || 0;
          const iniciado = userLevel > 0;
          const isSelected = activeIndex === index;

          const resolvedColors = getCategoryColors(medalla.tipo, colorScheme, medalla.color, medalla.colorFondo);

          const cardBg = iniciado 
            ? (isSelected ? resolvedColors.colorFondo : (colorScheme === 'dark' ? '#1c1c1e' : '#fcfcfc')) 
            : (colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7');
          
          const cardBorder = isSelected 
            ? resolvedColors.color 
            : (iniciado ? (colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea') : 'transparent');

          const textColor = iniciado 
            ? (colorScheme === 'dark' ? '#ffffff' : colors.textMain) 
            : (colorScheme === 'dark' ? '#8e8e93' : '#aeaeb2');

          return (
            <TouchableOpacity 
              key={medalla.tipo} 
              onPress={() => handleCategoryPress(index)}
              activeOpacity={0.8}
              style={[
                styles.medallaCard, 
                { 
                  width: cardWidth,
                  backgroundColor: cardBg, 
                  borderColor: cardBorder,
                  borderWidth: isSelected ? 2 : 1,
                  transform: [{ scale: isSelected ? 1.03 : 1 }],
                  elevation: isSelected ? 3 : 0,
                  shadowColor: isSelected ? resolvedColors.color : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.2 : 0,
                  shadowRadius: 4,
                }
              ]}
            >
              <View style={[styles.iconContainer, !iniciado && styles.iconMuted]}>
                <Text style={styles.medallaIcon}>{medalla.icono}</Text>
              </View>
              <Text 
                style={[
                  styles.medallaName, 
                  { color: textColor }
                ]} 
                numberOfLines={2}
              >
                {medalla.nombre}
              </Text>
              <Text style={[styles.levelTag, { 
                color: iniciado ? resolvedColors.color : '#8e8e93',
                fontWeight: iniciado ? 'bold' : 'normal'
              }]}>
                {iniciado ? `Nv. ${userLevel}` : 'Bloqueado'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sección: PROGRESO DE CATEGORÍA */}
      <View style={styles.carouselSection}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain, marginBottom: 16 }]}>
          PROGRESO DETALLADO
        </Text>

        {activeMedalla ? (
          <View>
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            >
              {carouselSlides.map((slideChunk, chunkIndex) => (
                <View 
                  key={`slide-${chunkIndex}`} 
                  style={{ 
                    width: slideWidth, 
                    flexDirection: 'row', 
                    flexWrap: 'wrap', 
                    justifyContent: 'space-between'
                  }}
                >
                  {slideChunk.map((medalla) => {
                    const userLevel = medalLevelMap.get(medalla.tipo) || 0;
                    const progressValue = getCategoryProgressValue(medalla.tipo, sightings, sightingsCount);
                    const { 
                      currentLevelName, 
                      nextLevelName, 
                      progreso, 
                      meta, 
                      porcentaje, 
                      isCompleted, 
                      nextConditionText,
                      label
                    } = getCategoryState(medalla, userLevel, progressValue);

                    const resolvedColors = getCategoryColors(medalla.tipo, colorScheme, medalla.color, medalla.colorFondo);

                    const cardBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
                    const cardBorder = colorScheme === 'dark' ? '#3a3a3c' : colors.borderColor;

                    const activeInspectLevel = selectedNivelMap[medalla.tipo] || Math.min(userLevel + 1, 5);
                    const inspectedNivelConfig = medalla.niveles.find(n => n.nivel === activeInspectLevel);

                    const progGap = 16;
                    const progCardWidth = itemsPerSlide >= 2 
                      ? (slideWidth - progGap) / 2 
                      : slideWidth;

                    return (
                      <View key={`progress-${medalla.tipo}`} style={{ width: progCardWidth, marginBottom: 16 }}>
                        <View 
                          style={[
                            styles.progressCard, 
                            { 
                              backgroundColor: cardBg, 
                              borderColor: cardBorder 
                            }
                          ]}
                        >
                          {/* Cabecera del Logro */}
                          <View style={styles.progressHeader}>
                            <View style={[styles.progressIconBg, { backgroundColor: resolvedColors.colorFondo }]}>
                              <Text style={styles.progressIconText}>{medalla.icono}</Text>
                            </View>
                            <View style={styles.progressTextCol}>
                              <Text style={[styles.progressTitle, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>
                                {medalla.nombre}
                              </Text>
                              <Text style={[styles.progressLevelText, { color: resolvedColors.color }]}>
                                Nivel {userLevel} - {currentLevelName}
                              </Text>
                              <Text style={[styles.progressNextText, { color: colorScheme === 'dark' ? '#aeaeb2' : '#8e8e93' }]}>
                                {nextConditionText}
                              </Text>
                            </View>
                            <View style={[styles.badgeContainer, { backgroundColor: resolvedColors.colorFondo, borderColor: resolvedColors.color }]}>
                              <Text style={[styles.badgeText, { color: resolvedColors.color }]}>
                                🎖️ Nv. {userLevel}
                              </Text>
                            </View>
                          </View>

                          {/* Barra de progreso */}
                          <View style={[styles.progressBarContainer, { backgroundColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea' }]}>
                            <View style={[styles.progressBarFill, { width: `${porcentaje}%`, backgroundColor: resolvedColors.color }]} />
                          </View>

                          <View style={styles.progressNumbersRow}>
                            <Text style={styles.progressNumberText}>{progreso} / {meta}</Text>
                            <Text style={[styles.progressPercentText, { color: resolvedColors.color }]}>{porcentaje}%</Text>
                          </View>

                          {/* Línea de tiempo de niveles (Timeline) */}
                          <View style={styles.timelineWrapper}>
                            <View style={[styles.timelineLine, { backgroundColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea' }]} />
                            <View 
                              style={[
                                styles.timelineLineFill, 
                                { 
                                  backgroundColor: resolvedColors.color, 
                                  width: `${Math.max(0, Math.min((userLevel) * 25, 100))}%` 
                                }
                              ]} 
                            />
                            
                            <View style={styles.timelineNodesRow}>
                              {medalla.niveles.map((nivelItem) => {
                                const isUnlocked = userLevel >= nivelItem.nivel;
                                const isActive = userLevel + 1 === nivelItem.nivel || (userLevel === 5 && nivelItem.nivel === 5);
                                const isInspected = activeInspectLevel === nivelItem.nivel;
                                
                                let circleBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
                                let circleBorder = colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea';

                                if (isUnlocked) {
                                  circleBg = resolvedColors.color;
                                  circleBorder = isInspected ? '#ffffff' : resolvedColors.color;
                                } else if (isActive) {
                                  circleBg = colorScheme === 'dark' ? '#1c1c1e' : '#ffffff';
                                  circleBorder = resolvedColors.color;
                                } else if (isInspected) {
                                  circleBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
                                  circleBorder = resolvedColors.color;
                                }

                                return (
                                  <TouchableOpacity 
                                    key={`node-${medalla.tipo}-${nivelItem.nivel}`} 
                                    style={styles.nodeContainer}
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedNivelMap(prev => ({
                                      ...prev,
                                      [medalla.tipo]: nivelItem.nivel
                                    }))}
                                  >
                                    <View 
                                      style={[
                                        styles.nodeCircle, 
                                        { 
                                          backgroundColor: circleBg, 
                                          borderColor: circleBorder,
                                          borderWidth: (isActive || isInspected) ? 2 : 1,
                                          transform: [{ scale: isInspected ? 1.15 : 1 }],
                                          elevation: isInspected ? 3 : 0,
                                          shadowColor: resolvedColors.color,
                                          shadowOffset: { width: 0, height: 1 },
                                          shadowOpacity: isInspected ? 0.3 : 0,
                                          shadowRadius: 2,
                                        }
                                      ]}
                                    >
                                      {isUnlocked ? (
                                        <Text style={styles.nodeCheck}>✓</Text>
                                      ) : isActive ? (
                                        <View style={[styles.nodeDot, { backgroundColor: resolvedColors.color }]} />
                                      ) : null}
                                    </View>
                                    <Text style={[styles.nodeLabel, { 
                                      color: isInspected 
                                        ? resolvedColors.color 
                                        : ((isUnlocked || isActive) ? (colorScheme === 'dark' ? '#ffffff' : colors.textMain) : '#8e8e93'),
                                      fontWeight: (isUnlocked || isActive || isInspected) ? 'bold' : 'normal'
                                    }]}>
                                      Nv.{nivelItem.nivel}
                                    </Text>
                                    <Text style={styles.nodeCondition}>
                                      {nivelItem.condicion}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>

                          {/* Detalle interactivo del nivel seleccionado */}
                          {inspectedNivelConfig && (
                            <View style={[
                              styles.inspectCard, 
                              { 
                                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fcfcfc',
                                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea',
                                borderLeftColor: resolvedColors.color
                              }
                            ]}>
                              <View style={styles.inspectHeader}>
                                <Text style={styles.inspectIcon}>{inspectedNivelConfig.icono}</Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.inspectName, { color: colorScheme === 'dark' ? '#ffffff' : colors.textMain }]}>
                                    Nv. {inspectedNivelConfig.nivel} - {inspectedNivelConfig.nombre}
                                  </Text>
                                  <Text style={styles.inspectCondition}>
                                    Requisito: {inspectedNivelConfig.condicion} {label}
                                  </Text>
                                </View>
                                <View style={[
                                  styles.statusBadge, 
                                  { 
                                    backgroundColor: userLevel >= inspectedNivelConfig.nivel 
                                      ? (colorScheme === 'dark' ? 'rgba(76, 217, 100, 0.15)' : '#e8f9ee')
                                      : (colorScheme === 'dark' ? 'rgba(142, 142, 147, 0.15)' : '#f2f2f7')
                                  }
                                ]}>
                                  <Text style={[
                                    styles.statusBadgeText, 
                                    { 
                                      color: userLevel >= inspectedNivelConfig.nivel 
                                        ? '#34c759' 
                                        : '#8e8e93' 
                                    }
                                  ]}>
                                    {userLevel >= inspectedNivelConfig.nivel ? 'Desbloqueado ✓' : 'Bloqueado 🔒'}
                                  </Text>
                                </View>
                              </View>
                              {userLevel >= inspectedNivelConfig.nivel && (
                                <Text style={[styles.inspectDesc, { color: colorScheme === 'dark' ? '#aeaeb2' : '#636366', marginTop: 6 }]}>
                                  {inspectedNivelConfig.descripcion}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* Puntos de paginación */}
            {totalSlides > 1 && (
              <View style={styles.paginationContainer}>
                {carouselSlides.map((_, slideIndex) => {
                  const currentSlideActiveIndex = Math.floor(activeIndex / itemsPerSlide);
                  const isSlideActive = currentSlideActiveIndex === slideIndex;
                  const firstItemOfSlide = carouselSlides[slideIndex][0];
                  const res = getCategoryColors(firstItemOfSlide.tipo, colorScheme, firstItemOfSlide.color, firstItemOfSlide.colorFondo);
                  
                  return (
                    <TouchableOpacity
                      key={`dot-${slideIndex}`}
                      onPress={() => handleCategoryPress(slideIndex * itemsPerSlide)}
                      style={[
                        styles.paginationDot, 
                        isSlideActive ? [styles.paginationDotActive, { backgroundColor: res.color }] : styles.paginationDotInactive
                      ]} 
                    />
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
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
    paddingBottom: 120,
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
    justifyContent: 'space-between',
  },
  medallaCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconMuted: {
    opacity: 0.3,
  },
  medallaIcon: {
    fontSize: 24,
    backgroundColor: 'transparent',
  },
  medallaName: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 11,
    height: 22,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  levelTag: {
    fontSize: 9,
    backgroundColor: 'transparent',
  },
  carouselSection: {
    marginTop: 24,
  },
  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconText: {
    fontSize: 24,
  },
  progressTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressLevelText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 1,
  },
  progressNextText: {
    fontSize: 11,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressNumberText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  timelineWrapper: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
    marginTop: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 4,
    borderRadius: 2,
    top: 18,
  },
  timelineLineFill: {
    position: 'absolute',
    left: 12,
    height: 4,
    borderRadius: 2,
    top: 18,
  },
  timelineNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  nodeContainer: {
    alignItems: 'center',
    width: 50,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCheck: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  nodeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeNumber: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  nodeLabel: {
    fontSize: 9,
    marginTop: 6,
  },
  nodeCondition: {
    fontSize: 9,
    color: '#8e8e93',
    marginTop: 1,
  },
  inspectCard: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
  },
  inspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  inspectIcon: {
    fontSize: 20,
  },
  inspectName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  inspectCondition: {
    fontSize: 10,
    color: '#8e8e93',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  inspectDesc: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
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
