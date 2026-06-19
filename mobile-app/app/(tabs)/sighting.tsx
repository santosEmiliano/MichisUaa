import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, Modal, TextInput, ActivityIndicator, Platform, useWindowDimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { alertService } from '@/services/alertService';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { Region } from 'react-native-maps';
import { MapView, Marker } from '@/components/Map';
import { getPublicAnimals, PublicAnimal } from '@/services/animalsApi';
import { createSighting } from '@/services/sightingsApi';
import { useColorScheme } from '@/components/useColorScheme';
import EmptyCatState from '@/components/EmptyCatState';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useIsFocused } from '@react-navigation/native';

export default function SightingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [catPage, setCatPage] = useState(0);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Obteniendo ubicación...');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [description, setDescription] = useState<string>('');
  const [animals, setAnimals] = useState<PublicAnimal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDesktopWeb, setIsDesktopWeb] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRotation = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
      setIsDesktopWeb(!isMobile);
    }
  }, []);

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  const handleScroll = (event: any) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: Math.max(0, scrollOffset.current - 250), animated: true });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: scrollOffset.current + 250, animated: true });
  };

  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempRegion, setTempRegion] = useState<Region | null>(null);

  const performReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      if (Platform.OS === 'web') {
        setLocationName(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        return;
      }
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const poi = place.name && place.name !== place.street ? place.name + ', ' : '';
        const street = place.street || 'Ubicación desconocida';
        const cityOrRegion = place.city || place.subregion || place.region || '';
        setLocationName(`${poi}${street}${cityOrRegion ? ', ' + cityOrRegion : ''}`);
      } else {
        setLocationName('Dirección no encontrada');
      }
    } catch (error) {
      setLocationName('Error al procesar dirección');
    }
  };

  // Carga la lista de gatos disponibles para seleccionar
  const fetchAnimalsData = useCallback(async () => {
    try {
      const data = await getPublicAnimals();
      setAnimals(data.filter(a => a.tipo === 'animal'));
    } catch (error) {
      console.error('Error fetching animals', error);
      alertService.error('Error', 'No pudimos cargar la lista de gatos. Verifica tu conexión.');
    } finally {
      setLoadingAnimals(false);
    }
  }, []);

  // Auto-polling cada 30s. En nativo usa AppState, en web usa Visibility API.
  // Solo se activa si esta pestaña está seleccionada (isFocused)
  useAutoRefresh(fetchAnimalsData, 30000, isFocused);

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
    fetchAnimalsData();
  }, [isRefreshing, fetchAnimalsData, refreshRotation]);

  useFocusEffect(
    useCallback(() => {
      const fetchLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Permiso de GPS denegado');
          alertService.warning('GPS requerido', 'MichisUAA necesita tu ubicación para registrar el avistamiento. Por favor, habilita el acceso al GPS en la configuración de tu dispositivo.');
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          setLocationCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          await performReverseGeocode(location.coords.latitude, location.coords.longitude);
        } catch (error) {
          setLocationName('Error al obtener ubicación');
          alertService.error('Error de ubicación', 'No pudimos obtener tu ubicación actual. Asegúrate de tener el GPS encendido e inténtalo de nuevo.');
        }
      };

      fetchLocation();
    }, [])
  );

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Validar formato en móvil
      if (Platform.OS !== 'web') {
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1].toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileType)) {
          alertService.warning('Formato no válido', 'Solo se permiten imágenes en formato JPG, PNG o WEBP.');
          return;
        }
      }

      // Validar tamaño si está disponible (límite de 5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        alertService.warning('Imagen demasiado pesada', 'La imagen seleccionada supera el límite de 5MB. Por favor, elige una más ligera o baja la resolución de tu cámara.');
        return;
      }

      setImageUri(asset.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    handleImageResult(result);
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alertService.warning('Permiso denegado', 'Se requiere acceso a la cámara para tomar una foto.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    handleImageResult(result);
  };

  const openMapModal = () => {
    if (locationCoords) {
      setTempRegion({
        ...locationCoords,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      setMapModalVisible(true);
    } else {
      alertService.info('Espera', 'Aún estamos obteniendo tu ubicación inicial.');
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    setTempRegion(region);
  };

  const confirmLocation = async () => {
    if (tempRegion) {
      setLocationCoords({
        latitude: tempRegion.latitude,
        longitude: tempRegion.longitude,
      });
      setMapModalVisible(false);
      setLocationName('Actualizando dirección...');
      await performReverseGeocode(tempRegion.latitude, tempRegion.longitude);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      alertService.warning('Falta la foto', 'Es obligatorio subir una foto del gato.');
      return;
    }
    if (!locationCoords) {
      alertService.info('Falta la ubicación', 'Estamos rastreando tu posición felina, por favor espera un par de segundos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSighting({
        latitud: locationCoords.latitude,
        longitud: locationCoords.longitude,
        animalId: selectedAnimalId,
        descripcion: description,
        fotoUri: imageUri,
      });

      alertService.success('¡Avistamiento enviado!', 'Tu reporte se mandó correctamente. Un administrador lo verificará pronto. ¡Muchas gracias por tu ayuda!');

      setImageUri(null);
      setDescription('');
      setSelectedAnimalId(null);

    } catch (error) {
      alertService.error('Error', 'Hubo un problema al enviar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerWidth = Math.min(width, 1200) - 40;
  const cols = Math.max(2, Math.floor(containerWidth / 97));
  const itemsPerPage = cols * 3;

  const filteredAnimals = animals.filter(a => a.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredAnimals.length / itemsPerPage));
  const displayedAnimals = isDesktop ? filteredAnimals.slice(catPage * itemsPerPage, (catPage + 1) * itemsPerPage) : filteredAnimals;

  const handleNextPage = () => setCatPage(p => Math.min(totalPages - 1, p + 1));
  const handlePrevPage = () => setCatPage(p => Math.max(0, p - 1));

  useEffect(() => {
    setCatPage(0);
  }, [isDesktop, filteredAnimals.length, width, searchQuery]);

  const warningBannerSection = (
    <View style={styles.warningBanner}>
      <Ionicons name="warning-outline" size={24} color="#fff" />
      <Text style={styles.warningText}>
        Está prohibido subir fotografías de personas. Por favor, sube únicamente la foto del gato.
      </Text>
    </View>
  );

  const photoSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Foto del avistamiento <Text style={styles.asterisk}>*</Text></Text>
      <View style={[styles.photoPreviewBox, isDesktop && { height: 320 }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Vista previa</Text>
        </View>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.emoji}>😸</Text>
        )}
      </View>
      <View style={styles.photoButtonsRow}>
        {isDesktopWeb ? (
          <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8} onPress={pickImage}>
            <Ionicons name="image-outline" size={20} color={colors.textWhite} />
            <Text style={styles.cameraButtonText}>Adjuntar foto</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8} onPress={handleCameraPress}>
              <Ionicons name="camera-outline" size={20} color={colors.textWhite} />
              <Text style={styles.cameraButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} activeOpacity={0.6} onPress={pickImage}>
              <Ionicons name="images-outline" size={20} color={colors.textMain} />
              <Text style={styles.galleryButtonText}>Galería</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: colors.textSecondary }}>
        Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB.
      </Text>
    </View>
  );

  const locationSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ubicación</Text>
      <View style={styles.locationBox}>
        <View style={styles.mapPlaceholder}>
          {locationCoords ? (
            <MapView
              provider="google"
              style={styles.miniMap}
              region={{
                latitude: locationCoords.latitude,
                longitude: locationCoords.longitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={locationCoords}>
                <View style={styles.customMarker}>
                  <Ionicons name="paw" size={18} color={colors.textWhite} />
                </View>
              </Marker>
            </MapView>
          ) : (
            <Text style={styles.mapEmoji}>📌</Text>
          )}
        </View>
        <View style={styles.locationStrip}>
          <View style={styles.locationStripLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
          </View>
          <TouchableOpacity onPress={openMapModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.changeText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const animalCardComponent = (animal: PublicAnimal) => (
    <TouchableOpacity
      key={animal.id}
      style={[
        styles.animalCard,
        selectedAnimalId === animal.id && styles.animalCardSelected
      ]}
      onPress={() => setSelectedAnimalId(animal.id === selectedAnimalId ? null : animal.id as number)}
    >
      {animal.foto_url ? (
        <Image source={{ uri: animal.foto_url }} style={styles.animalPhoto} />
      ) : (
        <View style={styles.animalPhotoPlaceholder}>
          <Text style={{ fontSize: 24 }}>😸</Text>
        </View>
      )}
      <Text style={[
        styles.animalName,
        selectedAnimalId === animal.id && styles.animalNameSelected
      ]} numberOfLines={1}>
        {animal.nombre}
      </Text>
    </TouchableOpacity>
  );

  const animalSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Qué gato es?</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar gato..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleManualRefresh} style={{ paddingHorizontal: 8 }}>
          <Animated.View style={{
            transform: [{
              rotate: refreshRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }]
          }}>
            <Ionicons name="refresh" size={20} color={isRefreshing ? colors.accentOrange : colors.textSecondary} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {loadingAnimals ? (
        <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={colors.accentOrange} />
          <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
            Rastreando michis cercanos...
          </Text>
        </View>
      ) : filteredAnimals.length === 0 ? (
        <EmptyCatState message="Buscamos por todas partes, pero no encontramos a ese michi." icon="magnify" />
      ) : isDesktop ? (
        <View>
          <View style={styles.animalDesktopGrid}>
            {displayedAnimals.map(animalCardComponent)}
          </View>
          {totalPages > 1 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity onPress={handlePrevPage} disabled={catPage === 0} style={styles.paginationBtn}>
                <Ionicons name="chevron-back" size={24} color={catPage === 0 ? colors.textSecondary : colors.textMain} />
              </TouchableOpacity>
              <Text style={styles.pageText}>Página {catPage + 1} de {totalPages}</Text>
              <TouchableOpacity onPress={handleNextPage} disabled={catPage >= totalPages - 1} style={styles.paginationBtn}>
                <Ionicons name="chevron-forward" size={24} color={catPage >= totalPages - 1 ? colors.textSecondary : colors.textMain} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.mobileScrollWrapper}>
          {isDesktopWeb && (
            <TouchableOpacity style={styles.mobileScrollArrow} onPress={scrollLeft}>
              <Ionicons name="chevron-back" size={24} color={colors.textMain} />
            </TouchableOpacity>
          )}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.animalList}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filteredAnimals.map(animalCardComponent)}
          </ScrollView>
          {isDesktopWeb && (
            <TouchableOpacity style={styles.mobileScrollArrow} onPress={scrollRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textMain} />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={16} color={colors.accentOrange} />
        <Text style={styles.hintText}>Si no logras identificar al gato, puedes dejarlo en blanco</Text>
      </View>
    </View>
  );

  const descriptionSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Descripción (Opcional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="¿Algún detalle extra sobre el gato o el lugar?"
        placeholderTextColor={colors.textSecondary}
        multiline={true}
        numberOfLines={4}
        maxLength={400}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />
      <Text style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: description.length >= 400 ? colors.metricaRojo : colors.textSecondary }}>
        {description.length} / 400
      </Text>
    </View>
  );

  const isSubmitDisabled = isSubmitting || !locationCoords;

  const submitBtn = (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled, { marginBottom: !locationCoords ? 8 : 0 }]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.textWhite} style={{ marginRight: 10 }} />
            <Text style={styles.submitButtonText}>Mandando michi-señal...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Enviar avistamiento</Text>
        )}
      </TouchableOpacity>
      {!locationCoords && (
        <Text style={{ textAlign: 'center', color: colors.metricaRojo, fontSize: 13, fontWeight: '500' }}>
          {locationName === 'Permiso de GPS denegado'
            ? 'Necesitas conceder permisos de GPS para poder enviar tu reporte'
            : 'Esperando a obtener tu ubicación para habilitar el botón...'}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.backIconContainer}>
                <Ionicons name="chevron-back" size={20} color={colors.textMain} />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reportar avistamiento</Text>
          </View>

          {isDesktop ? (
            <View style={styles.desktopMain}>
              <View style={styles.desktopRow}>
                <View style={styles.desktopCol}>
                  {photoSection}
                </View>
                <View style={[styles.desktopCol, { justifyContent: 'space-between' }]}>
                  {locationSection}
                  {descriptionSection}
                </View>
              </View>
              <View style={styles.warningDesktopWrapper}>
                <View style={styles.warningDesktopInner}>
                  {warningBannerSection}
                </View>
              </View>
              <View style={styles.desktopFull}>
                {animalSection}
                {submitBtn}
              </View>
            </View>
          ) : (
            <View style={styles.mobileMain}>
              {warningBannerSection}
              {photoSection}
              {locationSection}
              {animalSection}
              {descriptionSection}
              {submitBtn}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isMapModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajustar ubicación</Text>

            <View style={styles.modalMapContainer}>
              {tempRegion && (
                <MapView
                  provider="google"
                  style={styles.fullMap}
                  initialRegion={tempRegion}
                  onRegionChangeComplete={(region) => {
                    handleRegionChangeComplete(region);
                  }}
                  showsUserLocation={true}
                />
              )}
              <View style={styles.centerPinContainer} pointerEvents="none">
                <View style={[
                  styles.customMarkerLarge,
                  { opacity: 0.8, transform: [{ scale: 0.8 }] }
                ]}>
                  <Ionicons name="location-sharp" size={28} color={colors.textWhite} />
                </View>
              </View>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setMapModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmLocation}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 110,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  desktopMain: {
    width: '100%',
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 40,
  },
  desktopCol: {
    flex: 1,
  },
  desktopFull: {
    width: '100%',
    marginTop: 20,
  },
  warningDesktopWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  warningDesktopInner: {
    maxWidth: 600,
    width: '100%',
  },
  mobileMain: {
    width: '100%',
  },
  animalDesktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 15,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  pageText: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationBtn: {
    backgroundColor: colors.fondoGrisOscuro,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backIconContainer: {
    backgroundColor: colors.fondoGrisOscuro,
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textMain,
  },
  warningBanner: {
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 10,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 15,
  },
  asterisk: {
    color: colors.textSecondary,
  },
  photoPreviewBox: {
    backgroundColor: colors.bgPanel,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderColor,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.fondoGrisOscuro,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 60,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: colors.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cameraButtonText: {
    color: colors.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  galleryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 8,
  },
  galleryButtonText: {
    color: colors.textMain,
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  mapPlaceholder: {
    backgroundColor: colors.accentGreen,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    backgroundColor: colors.accentOrange,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  customMarkerLarge: {
    backgroundColor: colors.accentOrange,
    padding: 10,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  mapEmoji: {
    fontSize: 40,
  },
  locationStrip: {
    backgroundColor: colors.bgPanel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  locationStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.metricaVerde,
    marginRight: 10,
  },
  locationText: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  changeText: {
    color: colors.accentOrange,
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: colors.bgPanel,
    color: colors.textMain,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    fontSize: 16,
    minHeight: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textMain,
    fontSize: 16,
    paddingVertical: 12,
  },
  animalList: {
    gap: 12,
    paddingVertical: 5,
  },
  mobileScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileScrollArrow: {
    backgroundColor: colors.fondoGrisOscuro,
    padding: 8,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalCard: {
    alignItems: 'center',
    width: 85,
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.bgPanel,
  },
  animalCardSelected: {
    borderColor: colors.accentOrange,
    backgroundColor: colors.fondoGrisOscuro,
  },
  animalPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  animalPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  animalNameSelected: {
    color: colors.textMain,
    fontWeight: 'bold',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  hintText: {
    color: colors.accentOrange,
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.metricaVerde,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Fondo oscurecido
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '75%',
    maxWidth: 600,
    maxHeight: 700,
    alignSelf: 'center',
    backgroundColor: colors.bgPanel,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    color: colors.textMain,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    backgroundColor: colors.bgDark, // Contraste en el header del modal
  },
  modalMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.fondoGrisOscuro,
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    // Centrar con precisión dependiendo del tamaño del icono (padding 10 + size 28 + borde 3 = ~54px diameter -> -27 margin)
    marginLeft: -27,
    marginTop: -27,
    zIndex: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    backgroundColor: colors.bgDark,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: colors.textMain,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: colors.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
