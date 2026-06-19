import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alertService, AlertData } from '@/services/alertService';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AlertsContainer() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  useEffect(() => {
    const unsubscribe = alertService.subscribe((newAlert) => {
      setAlerts((prev) => {
        if (newAlert.priority === 'high') {
          return [newAlert];
        }
        if (prev.some(a => a.priority === 'high')) {
          return prev;
        }
        return [...prev, newAlert];
      });
    });
    return () => unsubscribe();
  }, []);

  const closeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleConfirm = (alert: AlertData) => {
    if (alert.onConfirm) alert.onConfirm();
    closeAlert(alert.id);
  };

  const handleCancel = (alert: AlertData) => {
    if (alert.onCancel) alert.onCancel();
    closeAlert(alert.id);
  };

  if (alerts.length === 0) return null;

  // Mostramos solo la alerta más antigua en caso de acumularse
  const currentAlert = alerts[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'question': return 'help-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return '#4ade80';
      case 'error': return '#f87171';
      case 'warning': return '#fbbf24';
      case 'question': return colors.accentOrange || '#e8893c';
      default: return '#60a5fa';
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={() => {
        if (currentAlert.type !== 'question') {
          closeAlert(currentAlert.id);
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertBox,
          { backgroundColor: colorScheme === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.borderColor },
          Platform.OS === 'web' && { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as any
        ]}>
          <View style={styles.header}>
            <Ionicons name={getIcon(currentAlert.type) as any} size={28} color={getIconColor(currentAlert.type)} />
            {currentAlert.title && (
              <Text style={[styles.title, { color: colors.textMain }]}>{currentAlert.title}</Text>
            )}
          </View>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>{currentAlert.message}</Text>

          <View style={styles.actions}>
            {currentAlert.type === 'question' ? (
              <>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnCancel, { borderColor: colors.borderColor }]} 
                  onPress={() => handleCancel(currentAlert)}
                >
                  <Text style={[styles.btnCancelText, { color: colors.textSecondary }]}>
                    {currentAlert.cancelText || 'Cancelar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnConfirm]} 
                  onPress={() => handleConfirm(currentAlert)}
                >
                  <Text style={styles.btnConfirmText}>
                    {currentAlert.confirmText || 'Confirmar'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.btn, styles.btnConfirm, { flex: 1, backgroundColor: getIconColor(currentAlert.type) }]} 
                onPress={() => handleConfirm(currentAlert)}
              >
                <Text style={styles.btnConfirmText}>Aceptar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  btnConfirm: {
    flex: 1,
    backgroundColor: '#e8893c',
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
