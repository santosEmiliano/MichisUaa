import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Modal, Pressable, useWindowDimensions, Animated, RefreshControl } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import EmptyCatState from '@/components/EmptyCatState';

interface Sighting {
  idAvistamiento: number;
  descripcion: string | null;
  verificado: boolean;
  verificadoPor: number | null;
  foto_url: string | null;
  createdAt: string;
  animal: {
    nombre: string;
    colonia: {
      nombre: string;
      zona: string;
    };
  } | null;
}

interface SightingHistoryTabProps {
  sightings: Sighting[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

const FILTERS = ['Todos', 'Verificados', 'Pendientes', 'Rechazados'];

// Determinar estado del avistamiento
function getStatus(s: Sighting): 'Verificado' | 'Pendiente' | 'Rechazado' {
  if (s.verificado) return 'Verificado';
  if (s.verificadoPor && !s.verificado) return 'Rechazado';
  return 'Pendiente';
}

// Colores del badge según estado
function getStatusColor(status: string) {
  switch (status) {
    case 'Verificado': return { bg: 'rgba(42, 122, 106, 0.25)', text: '#4ec9a8' };
    case 'Pendiente': return { bg: 'rgba(244, 164, 73, 0.25)', text: '#f4a449' };
    case 'Rechazado': return { bg: 'rgba(255, 13, 13, 0.25)', text: '#ff0d0d' };
    default: return { bg: 'rgba(100,100,100,0.2)', text: '#999' };
  }
}

// Formato de fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  const time = `${h}:${m} ${ampm}`;

  if (diffDays === 0) return `Hoy · ${time}`;
  if (diffDays === 1) return `Ayer · ${time}`;

  const day = date.getDate();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} de ${monthNames[date.getMonth()]} · ${time}`;
}

const AnimatedSightingCard = ({ sighting, index, itemsPerRow, setSelectedPhoto, colors }: any) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      })
    ]).start();
  }, [index]);

  const status = getStatus(sighting);
  const statusColors = getStatusColor(status);
  const catName = sighting.animal?.nombre || 'No identificado';
  const location = sighting.animal?.colonia?.zona || 'Ubicación desconocida';
  
  const cardWidthStyle = `${100 / itemsPerRow}%` as any;

  return (
    <Animated.View style={{ width: cardWidthStyle, paddingHorizontal: 6, marginBottom: 12, opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
        {sighting.foto_url ? (
          <TouchableOpacity onPress={() => setSelectedPhoto(sighting.foto_url)} activeOpacity={0.85}>
            <Image
              source={{ uri: sighting.foto_url }}
              style={styles.sightingImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.sightingImage, styles.sightingImagePlaceholder, { backgroundColor: colors.fondoGris }]}>
            <Text style={styles.placeholderEmoji}>🐱</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.catName, { color: colors.textMain }]} numberOfLines={1}>
              {catName}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text style={{ fontSize: 12 }}>📍</Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(sighting.createdAt)}
          </Text>

          {sighting.descripcion && (
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
              {sighting.descripcion}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default function SightingHistoryTab({ sightings, onRefresh, refreshing = false }: SightingHistoryTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Filtrar avistamientos según el chip activo
  const filtered = sightings.filter((s) => {
    if (activeFilter === 'Todos') return true;
    const status = getStatus(s);
    if (activeFilter === 'Verificados') return status === 'Verificado';
    if (activeFilter === 'Pendientes') return status === 'Pendiente';
    if (activeFilter === 'Rechazados') return status === 'Rechazado';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Filtros horizontales y Contador */}
      <View style={{ flexGrow: 0, paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textMain, marginBottom: 8 }}>
          Tus Avistamientos ({sightings.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.accentOrange : colors.fondoGris,
                  }
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  { color: isActive ? '#ffffff' : colors.textSecondary }
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Foto en la pantalla completa */}
        <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
          <Pressable style={styles.lightboxOverlay} onPress={() => setSelectedPhoto(null)}>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedPhoto(null)}>
              <Text style={styles.lightboxCloseText}>✕</Text>
            </TouchableOpacity>
          </Pressable>
        </Modal>
      </View>

      {/* Lista de avistamientos*/}
      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accentOrange]} tintColor={colors.accentOrange} /> : undefined
        }
      >
        {filtered.length === 0 ? (
          <EmptyCatState />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
            {filtered.map((sighting, index) => {
              const itemsPerRow = width >= 1024 ? 3 : (width >= 768 ? 2 : 1);
              return (
                <AnimatedSightingCard
                  key={sighting.idAvistamiento}
                  sighting={sighting}
                  index={index}
                  itemsPerRow={itemsPerRow}
                  setSelectedPhoto={setSelectedPhoto}
                  colors={colors}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listScroll: {
    flex: 1,
  },
  cardList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    height: '100%',
    alignItems: 'flex-start',
    gap: 12,
  },
  sightingImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginTop: 2,
  },
  sightingImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  catName: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    flexShrink: 1,
  },
  dateText: {
    fontSize: 12,
  },
  descriptionText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
  lightboxClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
