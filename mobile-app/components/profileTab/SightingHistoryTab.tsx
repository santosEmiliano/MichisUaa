import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

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

// Emoji de gato basado en el id nomas para que no quede vacía la imagen
const catEmojis = ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '🙀'];
function getCatEmoji(id: number): string {
  return catEmojis[id % catEmojis.length];
}

export default function SightingHistoryTab({ sightings }: SightingHistoryTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeFilter, setActiveFilter] = useState('Todos');

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
      {/* Filtros horizontales */}
      <View style={{ flexGrow: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
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
      </View>

      {/* Lista de avistamientos*/}
      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron avistamientos...
            </Text>
          </View>
        ) : (
          filtered.map((sighting) => {
            const status = getStatus(sighting);
            const statusColors = getStatusColor(status);
            const catName = sighting.animal?.nombre || 'No identificado';
            const location = sighting.animal?.colonia?.zona || 'Ubicación desconocida';

            return (
              <View
                key={sighting.idAvistamiento}
                style={[styles.card, { backgroundColor: colors.bgCard }]}
              >
                <Text style={styles.catEmoji}>{getCatEmoji(sighting.idAvistamiento)}</Text>

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
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
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
    paddingBottom: 24,
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
    marginBottom: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  catEmoji: {
    fontSize: 28,
    marginTop: 2,
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
});
