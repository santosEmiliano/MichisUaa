import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-map-clustering';
import { Marker, Callout } from 'react-native-maps';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getPublicAnimals, AnimalPublic } from '@/services/mapApi';

// Coordenadas de la UAA
const UAA_REGION = {
  latitude: 21.9135,
  longitude: -102.3164,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Valores animados
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Estados para los animales
  const [animals, setAnimals] = useState<AnimalPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede mostrar tu ubicación actual en el mapa.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Efecto para cargar los animales
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setIsLoading(true);
        const data = await getPublicAnimals();
        setAnimals(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los avistamientos de los michis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  // Efecto para animar los filtros
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: showFilters ? 0 : -20,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: showFilters ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showFilters]);

  // Filtros
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchText = animal.nombre.toLowerCase().includes(searchText.toLowerCase());
      if (!matchText) return false;

      if (activeFilter === 'Todos') return true;
      if (activeFilter === 'Desaparecidos') return animal.estado === 'Desaparecido';
      if (activeFilter === 'Activos') return animal.estado !== 'Desaparecido';

      return true;
    });
  }, [animals, searchText, activeFilter]);

  // Renderizado
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}
      >
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>+{points} Grupo</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={UAA_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
        renderCluster={renderCluster}
      >
        {filteredAnimals.map((animal, index) => {
          if (!animal.coordenadas) return null;

          const isDesaparecido = animal.estado === 'Desaparecido';
          const borderColor = isDesaparecido ? '#F44336' : '#4CAF50';

          return (
            <Marker
              key={`animal-${animal.nombre}-${animal.coordenadas.latitud}`}
              coordinate={{
                latitude: animal.coordenadas.latitud,
                longitude: animal.coordenadas.longitud,
              }}
            >
              <View style={[styles.customMarker, { borderColor }]}>
                {animal.foto_url ? (
                  <Image source={{ uri: animal.foto_url }} style={styles.markerImage} />
                ) : (
                  <Text style={styles.markerText}>?</Text>
                )}
              </View>

              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{animal.nombre}</Text>
                  <Text style={styles.calloutText}>Colonia: {animal.colonia}</Text>
                  <Text style={[styles.calloutStatus, { color: borderColor }]}>
                    {animal.estado}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <FontAwesome name="filter" size={20} color={showFilters ? '#F28C38' : '#666'} style={styles.filterIconBtn} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View 
        style={[
          styles.filtersContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        pointerEvents={showFilters ? "auto" : "none"}
      >
        {['Todos', 'Activos', 'Desaparecidos'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Verificado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Desaparecido</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterIconBtn: {
    marginLeft: 10,
    padding: 5,
  },
  filtersContainer: {
    position: 'absolute',
    top: 125,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#F28C38',
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  filterTextActive: {
    color: 'white',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  markerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clusterContainer: {
    backgroundColor: '#F28C38',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
