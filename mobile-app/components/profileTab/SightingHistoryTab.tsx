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

export default function SightingHistoryTab({ sightings }: SightingHistoryTabProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeFilter, setActiveFilter] = useState('Todos');

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

      {/* Tarjeta de prueba */}
      <View style={styles.cardList}>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Text style={styles.catEmoji}>🐱</Text>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.catName, { color: colors.textMain }]} numberOfLines={1}>
                Manchas
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(42, 122, 106, 0.25)' }]}>
                <Text style={[styles.statusText, { color: '#4ec9a8' }]}>Verificado</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={{ fontSize: 12 }}>📍</Text>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                Entrada sur, Ed. 108
              </Text>
            </View>

            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              10 de Mayo · 12:04 PM
            </Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de prueba */}
      <View style={styles.cardList}>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Text style={styles.catEmoji}>🐱</Text>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.catName, { color: colors.textMain }]} numberOfLines={1}>
                Michi
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(244, 164, 73, 0.25)' }]}>
                <Text style={[styles.statusText, { color: '#f4a449' }]}>Pendiente</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={{ fontSize: 12 }}>📍</Text>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                Centro de Ciencias Básicas
              </Text>
            </View>

            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              15 de Mayo · 9:42 AM
            </Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de prueba */}
      <View style={styles.cardList}>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Text style={styles.catEmoji}>🐱</Text>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.catName, { color: colors.textMain }]} numberOfLines={1}>
                Wakanda
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 13, 13, 0.25)' }]}>
                <Text style={[styles.statusText, { color: '#ff0d0d' }]}>Rechazado</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={{ fontSize: 12 }}>📍</Text>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                Unidad Médico Didáctica
              </Text>
            </View>

            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              7 de abril · 4:18 PM
            </Text>
          </View>
        </View>
      </View>
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
  cardList: {
    paddingHorizontal: 16,
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
});
