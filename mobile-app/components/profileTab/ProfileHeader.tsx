import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme, setColorScheme } from '@/components/useColorScheme';
import CatAvatar from './CatAvatar';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  initials: string;
  onLogout?: () => void;
}

export default function ProfileHeader({ userName, userEmail, initials, onLogout }: ProfileHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const toggleTheme = () => {
    const nextScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(nextScheme);
  };

  return (
    <View style={styles.headerRow}>
      {/* Grupo izquierdo: Avatar e Información */}
      <View style={styles.profileGroup}>
        <CatAvatar initials={initials} />

        <View style={styles.infoColumn}>
          <Text style={[styles.userName, { color: colors.textMain }]}>
            {userName}
          </Text>
          <View style={styles.roleRow}>
            <View style={[styles.roleDot, { backgroundColor: colors.metricaVerde }]} />
            <Text style={[styles.roleText, { color: colors.textSecondary }]}>
              {userEmail}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón derecho: Ícono de Configuración */}
      <TouchableOpacity
        style={[
          styles.themeButton,
          { backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro }
        ]}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons
          name="settings-outline"
          size={22}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Menú Flotante de Configuración */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownMenu, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#ffffff', borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea' }]}>
                
                <TouchableOpacity 
                  style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea' }]}
                  onPress={() => {
                    toggleTheme();
                    setMenuVisible(false);
                  }}
                >
                  <Ionicons name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.textMain} />
                  <Text style={[styles.menuItemText, { color: colors.textMain }]}>Cambiar tema</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#c0392b" />
                  <Text style={[styles.menuItemText, { color: '#c0392b' }]}>Cerrar sesión</Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoColumn: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    right: 24,
    width: 200,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
