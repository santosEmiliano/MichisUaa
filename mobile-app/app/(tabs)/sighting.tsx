import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function SightingScreen() {
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
            <Text style={styles.emoji}>😸</Text>
          </View>

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color={Colors.dark.textWhite} />
              <Text style={styles.cameraButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} activeOpacity={0.6}>
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
              <Text style={styles.mapEmoji}>📌</Text>
            </View>
            <View style={styles.locationStrip}>
              <View style={styles.locationStripLeft}>
                <View style={styles.greenDot} />
                <Text style={styles.locationText}>Entrada sur, Ed. 108</Text>
              </View>
              <TouchableOpacity>
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
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.dark.fondoGrisOscuro,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  },
  changeText: {
    color: Colors.dark.accentOrange,
    fontSize: 14,
    fontWeight: '600',
  },
});
