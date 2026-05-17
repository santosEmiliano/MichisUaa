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
});
