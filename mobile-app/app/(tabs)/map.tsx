import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image, Animated, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { MapClustering as MapView, Marker, Callout } from '@/components/Map';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getPublicAnimals, AnimalPublic } from '@/services/mapApi';
import Colors from '@/constants/Colors';
import { alertService } from '@/services/alertService';
import { useColorScheme } from '@/components/useColorScheme';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

// Coordenadas de la UAA
const UAA_REGION = {
  latitude: 21.9135,
  longitude: -102.3164,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

const AnimatedPin = ({ children, style }: any) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  // Merge the scale transform with the necessary -45deg rotation for the pin shape
  return (
    <Animated.View style={[style, { transform: [{ scale }, { rotate: '-45deg' }] }]}>
      {children}
    </Animated.View>
  );
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRotation = useRef(new Animated.Value(0)).current;

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  // Valores animados de Filtros
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Valores animados de Entrada
  const entranceFadeAnim = useRef(new Animated.Value(0)).current;
  const entranceSlideTopAnim = useRef(new Animated.Value(-30)).current;
  const entranceSlideBottomAnim = useRef(new Animated.Value(30)).current;
  
  // Estados para los animales
  const [animals, setAnimals] = useState<AnimalPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Fix Android: tracksViewChanges=false antes del primer layout deja marcadores en blanco
  const [markersReady, setMarkersReady] = useState(false);

  const [mapRegion, setMapRegion] = useState(UAA_REGION);

  const mapRef = useRef<any>(null);

  const centerOnUAA = () => {
    mapRef.current?.animateToRegion(UAA_REGION, 1000);
  };

  const isFarFromUAA = 
    Math.abs(mapRegion.latitude - UAA_REGION.latitude) > 0.005 ||
    Math.abs(mapRegion.longitude - UAA_REGION.longitude) > 0.005;

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de ubicación denegado.');
          alertService.warning("GPS requerido", "El mapa necesita tu ubicación. Por favor, habilita el acceso en la configuración.");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.warn("No se pudo obtener la ubicación:", error);
        alertService.error("Error de ubicación", "No pudimos obtener tu ubicación actual.");
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      entranceFadeAnim.setValue(0);
      entranceSlideTopAnim.setValue(-30);
      entranceSlideBottomAnim.setValue(30);
      
      Animated.parallel([
        Animated.timing(entranceFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(entranceSlideTopAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(entranceSlideBottomAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  // Carga los avistamientos del mapa
  const fetchAnimals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPublicAnimals();
      setAnimals(data);
    } catch (error) {
      alertService.error('Error', 'No se pudieron cargar los avistamientos de los michis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-polling cada 30s
  useAutoRefresh(fetchAnimals, 30000);

  // Refresh manual 
  const handleManualRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    refreshRotation.setValue(0);
    Animated.timing(refreshRotation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setIsRefreshing(false));
    fetchAnimals();
  }, [isRefreshing, fetchAnimals, refreshRotation]);

  // Una vez cargados los animales, damos tiempo al mapa para
  // los marcadores antes de congelar el tracking
  useEffect(() => {
    if (!isLoading && animals.length > 0) {
      const t = setTimeout(() => setMarkersReady(true), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading, animals]);

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
    // Agrupar por coordenadas para separar solo los que están empalmados exactamente en el mismo lugar
    const locationCounts: Record<string, number> = {};

    return animals
      .map((animal, index) => {
        let jitteredCoords = animal.coordenadas;
        if (animal.coordenadas) {
          const locKey = `${animal.coordenadas.latitud},${animal.coordenadas.longitud}`;
          const count = locationCounts[locKey] || 0;
          locationCounts[locKey] = count + 1;
          
          if (count > 0) {
            // Reducimos el radio significativamente para evitar la ilusión de que se "mueven" al hacer zoom
            const angle = (count * 137.5) * (Math.PI / 180); 
            const radius = 0.000015 * Math.sqrt(count); // Aprox 1.5 metros, muy sutil
            
            jitteredCoords = {
              latitud: Number(animal.coordenadas.latitud) + Math.sin(angle) * radius,
              longitud: Number(animal.coordenadas.longitud) + Math.cos(angle) * radius,
            };
          } else {
            jitteredCoords = {
              latitud: Number(animal.coordenadas.latitud),
              longitud: Number(animal.coordenadas.longitud),
            };
          }
        }
        return { ...animal, originalIndex: index, coordenadas: jitteredCoords };
      })
      .filter((animal) => {
        if (!animal.coordenadas) return false;

        const matchText = animal.nombre.toLowerCase().includes(searchText.toLowerCase());
        if (!matchText) return false;

        if (activeFilter === 'Todos') return true;
        if (activeFilter === 'Desaparecidos') return animal.estado === 'Desaparecido';
        if (activeFilter === 'No Registrados') return animal.estado === 'NoRegistrado';
        if (activeFilter === 'Registrados') return animal.estado === 'Registrado';

        return true;
      });
  }, [animals, searchText, activeFilter]);

  // Renderizado
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={`cluster-${id}-${activeFilter}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}
      >
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>{points}</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider="google"
        style={styles.map}
        initialRegion={UAA_REGION}
        minZoomLevel={14}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        renderCluster={renderCluster}
        showsUserLocation={true}
        clusterColor="#F28C38"
      >
        {filteredAnimals.map((animal) => {
          if (!animal.coordenadas) return null;

          const statusColor = animal.estado === 'Registrado' ? '#4CAF50' : animal.estado === 'Desaparecido' ? '#F44336' : '#FF9800';
          
          return (
            <Marker
              key={`animal-${animal.id ?? animal.originalIndex}-${activeFilter}`}
              coordinate={{
                latitude: Number(animal.coordenadas.latitud),
                longitude: Number(animal.coordenadas.longitud),
              }}
              tracksViewChanges={!markersReady}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -30 }}
              // @ts-ignore
              webOffset={[32, 63]}
            >
              <View style={{ width: 64, height: 64, justifyContent: 'center', alignItems: 'center' }}>
                <AnimatedPin style={[
                  styles.customMarker, 
                  { 
                    borderColor: statusColor,
                    backgroundColor: theme === 'dark' ? '#2A2A2A' : 'white'
                  }
                ]}>
                  {animal.foto_url ? (
                    <Image source={{ uri: animal.foto_url }} style={styles.markerImage} />
                  ) : (
                    <Text style={[styles.markerText, { color: theme === 'dark' ? '#AAA' : '#666' }]}>
                      {animal.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  )}
                </AnimatedPin>
              </View>
              <Callout tooltip>
                <View style={[
                  styles.calloutContainer,
                  { backgroundColor: theme === 'dark' ? '#1E1E1E' : 'white' }
                ]}>
                  {animal.foto_url && <Image source={{ uri: animal.foto_url }} style={styles.calloutImage} />}
                  <Text style={[styles.calloutTitle, { color: colors.textMain }]}>{animal.nombre}</Text>
                  <Text style={[styles.calloutText, { color: colors.textSecondary }]}>{animal.colonia}</Text>
                  <Text style={[styles.calloutStatus, { color: statusColor }]}>{animal.estado}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <Animated.View style={[
        styles.searchContainer,
        {
          opacity: entranceFadeAnim,
          transform: [{ translateY: entranceSlideTopAnim }]
        },
        Platform.OS === 'web' && { left: 0, right: 0, alignItems: 'center', top: 30 } as any
      ]}>
        <View style={[
          styles.searchBox, 
          { backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.9)', borderColor: colors.borderColor, borderWidth: theme === 'dark' ? 1 : 0 },
          Platform.OS === 'web' && { width: '90%', maxWidth: 600, paddingVertical: 14, borderRadius: 30, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } as any
        ]}>
          <FontAwesome name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Buscar por nombre..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <FontAwesome name="filter" size={20} color={showFilters ? colors.accentOrange : colors.textSecondary} style={styles.filterIconBtn} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManualRefresh} style={styles.filterIconBtn}>
            <Animated.View style={{
              transform: [{
                rotate: refreshRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}>
              <FontAwesome name="refresh" size={20} color={isRefreshing ? colors.accentOrange : colors.textSecondary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.filtersContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }]
          },
          Platform.OS === 'web' && { top: 100, alignItems: 'center' } as any
        ]}
        pointerEvents={showFilters ? "auto" : "none"}
      >
        <ScrollView 
          horizontal 
          style={Platform.OS === 'web' ? { maxWidth: '100%' } : undefined}
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ 
            gap: 10, 
            paddingHorizontal: 20, 
            flexGrow: 1, 
            justifyContent: 'flex-start' 
          }}
        >
          {['Todos', 'Registrados', 'No Registrados', 'Desaparecidos'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                { backgroundColor: theme === 'dark' ? colors.bgCard : 'rgba(255, 255, 255, 0.9)' },
                activeFilter === filter && { backgroundColor: colors.accentOrange },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme === 'dark' ? colors.textSecondary : '#555' },
                  activeFilter === filter && { color: colors.textWhite },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View style={[
        styles.legendContainer,
        {
          opacity: entranceFadeAnim,
          transform: [{ translateY: entranceSlideBottomAnim }],
          backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: colors.borderColor,
          borderWidth: theme === 'dark' ? 1 : 0
        },
        Platform.OS === 'web' && { padding: isSmallScreen ? 14 : 24, borderRadius: 16, bottom: 110, left: isSmallScreen ? 10 : 30, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } as any
      ]}>
        <View style={[styles.legendItem, Platform.OS === 'web' && { marginVertical: isSmallScreen ? 4 : 8 } as any]}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }, Platform.OS === 'web' && { width: isSmallScreen ? 12 : 16, height: isSmallScreen ? 12 : 16, borderRadius: isSmallScreen ? 6 : 8, marginRight: 12 } as any]} />
          <Text style={[styles.legendText, { color: colors.textMain }, Platform.OS === 'web' && { fontSize: isSmallScreen ? 13 : 16, fontWeight: '600' } as any]}>Registrado</Text>
        </View>
        <View style={[styles.legendItem, Platform.OS === 'web' && { marginVertical: isSmallScreen ? 4 : 8 } as any]}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }, Platform.OS === 'web' && { width: isSmallScreen ? 12 : 16, height: isSmallScreen ? 12 : 16, borderRadius: isSmallScreen ? 6 : 8, marginRight: 12 } as any]} />
          <Text style={[styles.legendText, { color: colors.textMain }, Platform.OS === 'web' && { fontSize: isSmallScreen ? 13 : 16, fontWeight: '600' } as any]}>No Registrado</Text>
        </View>
        <View style={[styles.legendItem, Platform.OS === 'web' && { marginVertical: isSmallScreen ? 4 : 8 } as any]}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }, Platform.OS === 'web' && { width: isSmallScreen ? 12 : 16, height: isSmallScreen ? 12 : 16, borderRadius: isSmallScreen ? 6 : 8, marginRight: 12 } as any]} />
          <Text style={[styles.legendText, { color: colors.textMain }, Platform.OS === 'web' && { fontSize: isSmallScreen ? 13 : 16, fontWeight: '600' } as any]}>Desaparecido</Text>
        </View>
      </Animated.View>

      {isFarFromUAA && (
        <Animated.View style={[
          styles.recenterContainer,
          {
            opacity: entranceFadeAnim,
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.recenterButton, 
              { 
                backgroundColor: theme === 'dark' ? colors.bgPanel : 'rgba(255, 255, 255, 0.95)',
                borderColor: theme === 'dark' ? colors.borderColor : '#eee'
              }
            ]} 
            onPress={centerOnUAA}
          >
            <FontAwesome name="university" size={20} color={colors.accentOrange} />
          </TouchableOpacity>
        </Animated.View>
      )}
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
    left: 0,
    right: 0,
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
    bottom: 110,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderBottomLeftRadius: 0,
    borderWidth: 3,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    transform: [{ rotate: '-45deg' }],
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ rotate: '45deg' }],
  },
  markerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    transform: [{ rotate: '45deg' }],
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
    resizeMode: 'cover',
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
  recenterContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 1,
  },
  recenterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
});
