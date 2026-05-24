import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function SightingScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Obteniendo ubicación...');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);

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
        
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          // place.name contiene Puntos de Interés (ej. "Edificio 54", "Centro de Ciencias Básicas")
          const poi = place.name && place.name !== place.street ? place.name + ', ' : '';
          const street = place.street || 'Ubicación desconocida';
          const cityOrRegion = place.city || place.subregion || place.region || '';

          setLocationName(`${poi}${street}${cityOrRegion ? ', ' + cityOrRegion : ''}`);
        } else {
          setLocationName('Dirección no encontrada');
        }
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
    Alert.alert('Mensaje', 'La funcionalidad de tomar fotos con la cámara será implementada próximamente.');
  };

  const handleChangeLocation = () => {
    Alert.alert('Mensaje', 'La selección manual en el mapa se implementará próximamente.');
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

        {/* Foto del avistamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto del avistamiento</Text>

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
              <TouchableOpacity onPress={handleChangeLocation}>
                <Text style={styles.changeText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
});
