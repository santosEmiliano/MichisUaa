import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Animated, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { MapClustering as MapView, Marker, Callout } from '@/components/Map';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getPublicAnimals, AnimalPublic } from '@/services/mapApi';
import { alertService } from '@/services/alertService';
import { useColorScheme } from '@/components/useColorScheme';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useIsFocused } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import {
  UAA_REGION,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  ZOOM_LEVEL_STEP,
  RECENTER_DISTANCE_THRESHOLD,
  RECENTER_ZOOM_TOLERANCE,
  regionAfterZoom,
  zoomLevelForRegion,
  canZoom,
  MapRegion,
} from '@/constants/mapConfig';

// Los controles van siempre encima de las teselas del mapa, no del fondo de la
// app, así que conservan el mismo contraste en tema claro y oscuro.
const MAP_CONTROL_SURFACE = '#FFFFFF';
const MAP_CONTROL_OUTLINE = '#1A1A1A';

type MapControlButtonProps = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  size: number;
  accentColor: string;
  disabled?: boolean;
};

/**
 * Botón redondo de control del mapa.
 * En reposo: relleno blanco con contorno e ícono negros.
 * Presionado: relleno naranja con ícono blanco.
 */
const MapControlButton = ({
  icon,
  label,
  onPress,
  size,
  accentColor,
  disabled = false,
}: MapControlButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const isActive = isPressed && !disabled;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      // El feedback lo da el cambio de color, no la opacidad por defecto.
      activeOpacity={1}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.mapControlButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isActive ? accentColor : MAP_CONTROL_SURFACE,
          borderColor: isActive ? accentColor : MAP_CONTROL_OUTLINE,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <FontAwesome
        name={icon}
        size={Math.round(size * 0.45)}
        color={isActive ? MAP_CONTROL_SURFACE : MAP_CONTROL_OUTLINE}
      />
    </TouchableOpacity>
  );
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
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRotation = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  // El mapa ocupa toda la pantalla (sin header, con la tab bar encima), así que
  // las medidas de la ventana son las del contenedor del mapa. Se necesitan para
  // traducir entre región y nivel de zoom.
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const controlSize = isSmallScreen ? 44 : 38;

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

  const [mapRegion, setMapRegion] = useState<MapRegion>(UAA_REGION);

  const mapRef = useRef<any>(null);

  // `mapRegion` solo se actualiza cuando el mapa termina de moverse, así que dos
  // toques rápidos en +/- leerían el mismo valor viejo y el zoom se saltaría un
  // paso. Este ref guarda el destino de forma síncrona y se reconcilia cuando el
  // mapa avisa que ya llegó.
  const targetRegionRef = useRef<MapRegion>(UAA_REGION);

  // Nivel de zoom que el dispositivo aplica realmente al encuadrar el campus.
  // El mapa ajusta la región que le pedimos a la proporción de la pantalla, así
  // que este valor se mide en vez de asumirse.
  const campusZoomRef = useRef<number | null>(null);
  const measureCampusRef = useRef(true);

  const applyRegion = useCallback((region: MapRegion, duration = 300) => {
    targetRegionRef.current = region;
    setMapRegion(region);
    mapRef.current?.animateToRegion(region, duration);
  }, []);

  const handleRegionChangeComplete = useCallback(
    (region: MapRegion) => {
      if (measureCampusRef.current && region?.latitudeDelta) {
        measureCampusRef.current = false;
        campusZoomRef.current = zoomLevelForRegion(region, width, height);
      }
      targetRegionRef.current = region;
      setMapRegion(region);
    },
    [width, height]
  );

  const zoomBy = useCallback(
    (levels: number) =>
      applyRegion(regionAfterZoom(targetRegionRef.current, levels, width, height), 250),
    [applyRegion, width, height]
  );

  const zoomIn = useCallback(() => zoomBy(ZOOM_LEVEL_STEP), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(-ZOOM_LEVEL_STEP), [zoomBy]);

  // Vuelve al encuadre de campus completo: centra en la UAA y ajusta el zoom
  // para que se vea la universidad entera con sus avistamientos.
  const centerOnUAA = useCallback(() => {
    measureCampusRef.current = true;
    applyRegion(UAA_REGION, 600);
  }, [applyRegion]);

  const canZoomIn = canZoom(mapRegion, ZOOM_LEVEL_STEP, width, height);
  const canZoomOut = canZoom(mapRegion, -ZOOM_LEVEL_STEP, width, height);

  // El botón de recentrar aparece si el usuario se alejó del campus o si cambió
  // el zoom lo suficiente como para perder el encuadre de campus completo.
  // Mientras no hayamos medido a qué nivel encuadra el campus este dispositivo,
  // asumimos que el encuadre es el correcto: si no, al tocar "centrar" el botón
  // parpadearía entre lo que pedimos y lo que el mapa termina aplicando.
  const zoomOffset =
    campusZoomRef.current === null
      ? 0
      : zoomLevelForRegion(mapRegion, width, height) - campusZoomRef.current;
  const isFarFromUAA =
    Math.abs(mapRegion.latitude - UAA_REGION.latitude) > RECENTER_DISTANCE_THRESHOLD ||
    Math.abs(mapRegion.longitude - UAA_REGION.longitude) > RECENTER_DISTANCE_THRESHOLD ||
    Math.abs(zoomOffset) > RECENTER_ZOOM_TOLERANCE;

  // Solo pedimos el permiso: `showsUserLocation` necesita que esté concedido
  // para pintar el punto azul, pero la posición en sí la resuelve el mapa. Antes
  // se llamaba además a getCurrentPositionAsync para guardarla en un estado que
  // nunca se leía, gastando batería sin motivo.
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de ubicación denegado.');
          alertService.warning("GPS requerido", "El mapa necesita tu ubicación. Por favor, habilita el acceso en la configuración.");
        }
      } catch (error) {
        console.warn("No se pudo solicitar el permiso de ubicación:", error);
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

  // El polling corre cada 30 s; sin esta bandera, un backend caído dispara una
  // alerta cada medio minuto para siempre. Se avisa una vez por caída y se
  // rearma cuando el servidor vuelve a responder.
  const hasReportedErrorRef = useRef(false);

  // Carga los avistamientos del mapa
  const fetchAnimals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPublicAnimals();
      setAnimals(data);
      hasReportedErrorRef.current = false;
    } catch (error) {
      if (!hasReportedErrorRef.current) {
        hasReportedErrorRef.current = true;
        alertService.error('Error', 'No se pudieron cargar los avistamientos de los michis.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-polling cada 30s. En nativo usa AppState, en web usa Visibility API.
  // Solo se activa si esta pestaña está seleccionada (isFocused)
  useAutoRefresh(fetchAnimals, 30000, isFocused);

  // Refresh manual
  const handleManualRefresh = useCallback(() => {
    if (isRefreshing) return;
    // El usuario pidió el reintento explícitamente: si vuelve a fallar, sí
    // queremos avisarle aunque ya hubiéramos reportado la caída.
    hasReportedErrorRef.current = false;
    setIsRefreshing(true);
    refreshRotation.setValue(0);
    Animated.timing(refreshRotation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setIsRefreshing(false));
    fetchAnimals();
  }, [isRefreshing, fetchAnimals, refreshRotation]);

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

  // Firma del conjunto de marcadores. Cambia solo si aparecen o desaparecen
  // marcadores, no en cada poll que devuelve exactamente lo mismo.
  const markersSignature = useMemo(
    () => filteredAnimals.map((animal) => animal.id ?? animal.originalIndex).join('|'),
    [filteredAnimals]
  );

  // Damos una ventana de tracking cada vez que cambia el conjunto de marcadores.
  // Con tracksViewChanges={false} desde el primer frame, Android pinta los pines
  // en blanco, así que hay que rearmarlo cuando entran marcadores nuevos (cambio
  // de filtro o avistamientos recién llegados por el polling).
  useEffect(() => {
    setMarkersReady(false);
    const t = setTimeout(() => setMarkersReady(true), 500);
    return () => clearTimeout(t);
  }, [markersSignature]);

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
        minZoomLevel={MIN_ZOOM_LEVEL}
        maxZoomLevel={MAX_ZOOM_LEVEL}
        onRegionChangeComplete={handleRegionChangeComplete}
        renderCluster={renderCluster}
        showsUserLocation={true}
        clusterColor="#F28C38"
      >
        {filteredAnimals.map((animal) => {
          if (!animal.coordenadas) return null;

          const statusColor = animal.estado === 'Registrado' ? '#4CAF50' : animal.estado === 'Desaparecido' ? '#F44336' : '#FF9800';

          return (
            <Marker
              key={`animal-${animal.id ?? animal.originalIndex}`}
              coordinate={{
                latitude: Number(animal.coordenadas.latitud),
                longitude: Number(animal.coordenadas.longitud),
              }}
              tracksViewChanges={!markersReady}
              // El ancla inferior-centro deja la punta del pin sobre la
              // coordenada. Antes se sumaba además centerOffset, que solo aplica
              // en iOS, así que el pin caía en un punto distinto por plataforma.
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerWrapper}>
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

      <Animated.View
        style={[
          styles.mapControlsContainer,
          { opacity: entranceFadeAnim },
          !isSmallScreen && ({ bottom: 130, right: 30 } as any),
        ]}
      >
        <MapControlButton
          icon="search-plus"
          label="Acercar el mapa"
          onPress={zoomIn}
          disabled={!canZoomIn}
          size={controlSize}
          accentColor={colors.accentOrange}
        />
        <MapControlButton
          icon="search-minus"
          label="Alejar el mapa"
          onPress={zoomOut}
          disabled={!canZoomOut}
          size={controlSize}
          accentColor={colors.accentOrange}
        />
        {isFarFromUAA && (
          <MapControlButton
            icon="university"
            label="Centrar en la UAA"
            onPress={centerOnUAA}
            size={controlSize}
            accentColor={colors.accentOrange}
          />
        )}
      </Animated.View>
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
  // El pin de 44x44 rotado -45° saca su punta ~9px por debajo de su caja, así que
  // centrado dentro de este contenedor de 64x64 la punta queda justo en el borde
  // inferior, que es donde el Marker ancla con anchor={{ x: 0.5, y: 1 }}.
  markerWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
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
  mapControlsContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 1,
    alignItems: 'center',
    gap: 10,
  },
  mapControlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
