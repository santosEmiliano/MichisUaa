import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';

export default function SightingScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Obteniendo ubicación...');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  // Estados para el Modal del Mapa
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempRegion, setTempRegion] = useState<Region | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Función reutilizable para Geocodificación Inversa (convertir GPS a Texto)
  const performReverseGeocode = async (latitude: number, longitude: number) => {
    try {
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Permiso de GPS denegado');
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
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCameraPress = () => {
    Alert.alert('Información', 'La funcionalidad de tomar fotos con la cámara será implementada próximamente.');
  };

  // --- Lógica del Mapa Interactivo ---
  const openMapModal = () => {
    if (locationCoords) {
      setTempRegion({
        ...locationCoords,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      setMapModalVisible(true);
    } else {
      Alert.alert('Espera', 'Aún estamos obteniendo tu ubicación inicial.');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backIconContainer}>
              <Ionicons name="chevron-back" size={20} color={Colors.dark.textWhite} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reportar avistamiento</Text>
        </View>

        {/* Banner Advertencia */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={24} color="#fff" />
          <Text style={styles.warningText}>
            Está prohibido subir fotografías de personas. Por favor, sube únicamente la foto del gato.
          </Text>
        </View>

        {/* Foto del avistamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto del avistamiento <Text style={styles.asterisk}>*</Text></Text>
          
          <View style={styles.photoPreviewBox}>
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
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8} onPress={handleCameraPress}>
              <Ionicons name="camera-outline" size={20} color={Colors.dark.textWhite} />
              <Text style={styles.cameraButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} activeOpacity={0.6} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color={Colors.dark.textWhite} />
              <Text style={styles.galleryButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          <View style={styles.locationBox}>
            <View style={styles.mapPlaceholder}>
              {locationCoords ? (
                <MapView
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
                      <Ionicons name="paw" size={18} color={Colors.dark.textWhite} />
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
      </ScrollView>

      {/* Modal Interactivo de Mapa */}
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
                  style={styles.fullMap}
                  initialRegion={tempRegion}
                  onRegionChange={() => setIsDragging(true)}
                  onRegionChangeComplete={(region) => {
                    handleRegionChangeComplete(region);
                    setIsDragging(false);
                  }}
                  showsUserLocation={true}
                />
              )}
              {/* Pin central fijo */}
              <View style={styles.centerPinContainer} pointerEvents="none">
                <View style={[
                  styles.customMarkerLarge,
                  isDragging && { transform: [{ scale: 0.7 }], opacity: 0.7 }
                ]}>
                  <Ionicons name="location-sharp" size={28} color={Colors.dark.textWhite} />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.bgDark,
  },
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
    backgroundColor: Colors.dark.fondoGrisOscuro,
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.textWhite,
  },
  warningBanner: {
    backgroundColor: '#E74C3C', // Red color suitable for warnings
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
    color: Colors.dark.textSecondary,
    marginBottom: 15,
  },
  asterisk: {
    color: Colors.dark.textSecondary,
  },
  photoPreviewBox: {
    backgroundColor: Colors.dark.bgPanel,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.dark.borderColor,
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
    backgroundColor: Colors.dark.fondoGrisOscuro,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: Colors.dark.textSecondary,
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
    backgroundColor: Colors.dark.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cameraButtonText: {
    color: Colors.dark.textWhite,
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
    borderColor: Colors.dark.borderColor,
    gap: 8,
  },
  galleryButtonText: {
    color: Colors.dark.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.borderColor,
  },
  mapPlaceholder: {
    backgroundColor: Colors.dark.accentGreen,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    backgroundColor: Colors.dark.accentOrange,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.dark.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  customMarkerLarge: {
    backgroundColor: Colors.dark.accentOrange,
    padding: 10,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.dark.textWhite,
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
    backgroundColor: Colors.dark.bgPanel,
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
    backgroundColor: Colors.dark.metricaVerde,
    marginRight: 10,
  },
  locationText: {
    color: Colors.dark.textWhite,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  changeText: {
    color: Colors.dark.accentOrange,
    fontSize: 14,
    fontWeight: '600',
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
    height: '75%', // Rectángulo alargado verticalmente
    backgroundColor: Colors.dark.bgPanel,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    color: Colors.dark.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.borderColor,
    backgroundColor: Colors.dark.bgDark, // Contraste en el header del modal
  },
  modalMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.dark.fondoGrisOscuro,
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
    borderTopColor: Colors.dark.borderColor,
    backgroundColor: Colors.dark.bgDark,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.dark.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.dark.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: Colors.dark.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
