import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, useWindowDimensions, Modal, Linking } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Servicios
import { handleLogin } from '@/services/authApi';
import { saveSession, getSession } from '@/services/sessionStorage';
import { registrarPushToken } from '@/hooks/useAuth';

// Utils
import { showAlert } from '@/utils/alerts';
import WebBackground from '@/components/WebBackground';
import WebRegisterForm from '@/components/WebRegisterForm';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { height, width } = useWindowDimensions();

  // Escala dinámica para web:
  // Prevenimos que scale sea 0 en SSR cuando height/width son 0
  const scale = Platform.OS === 'web' && height > 0 ? Math.min(1, height / 850, width / 450) : 1;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);

  const toggleForm = () => {
    if (Platform.OS === 'web') {
      setAnimating(true);
      setTimeout(() => {
        setIsRegistering(!isRegistering);
        setTimeout(() => {
          setAnimating(false);
        }, 50);
      }, 200);
    } else {
      router.push('/register');
    }
  };

  const onLoginPress = async () => {
    // Validación de correo vacío
    if (!email.trim()) {
      showAlert("Atención", "Por favor ingresa tu correo electrónico.");
      return;
    }

    // Validación de formato de correo (regex para @ y dominio)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert("Atención", "Por favor ingresa un correo electrónico válido (ej. usuario@edu.uaa.mx).");
      return;
    }

    if (!password) {
      showAlert("Atención", "Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    try {
      const result = await handleLogin(email.trim(), password);

      // Guardar sesión de forma segura (SecureStore en móvil, localStorage en web)
      await saveSession(result.token, result.datos.id, result.datos.nombre, email.trim());

      // Registrar token push después de un inicio de sesión exitoso
      registrarPushToken().catch(err => console.error("Error al registrar push token:", err));

      // Redirigir al primer tab, reemplazando el historial de navegación
      // para que el usuario no pueda volver al login con el botón "Atrás"
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgDark }]}>
      <WebBackground />
      <KeyboardAvoidingView 
        style={[styles.container, Platform.OS === 'web' && { zIndex: 10 } as any]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[
          styles.content,
          Platform.OS === 'web' && { transform: [{ scale }] }
        ]}>
          {/* Header */}
          <View style={[styles.header, Platform.OS === 'web' && { transition: 'opacity 0.2s ease', opacity: animating ? 0 : 1 } as any]}>
            {(!isRegistering || Platform.OS !== 'web') && (
              <Image 
                source={require('../assets/images/MichisUAALogo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.title, { color: colors.textMain }]}>
              {isRegistering ? "Únete a MichisUAA" : "MichisUAA"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isRegistering ? "Ayuda a cuidar las colonias del campus" : "Colonias felinas del campus"}
            </Text>
          </View>

          {/* Card */}
          <View style={[
            styles.card, 
            { backgroundColor: colors.bgPanel, borderColor: colors.borderColor },
            Platform.OS === 'web' && {
              backgroundColor: colorScheme === 'dark' ? 'rgba(22, 36, 34, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)',
              borderWidth: 1,
              borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            } as any
          ]}>
            {Platform.OS === 'web' && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundImage: 'linear-gradient(90deg, transparent, #e8893c, #c28c46, transparent)'
              } as any} />
            )}
            
            <View style={[Platform.OS === 'web' && { transition: 'opacity 0.2s ease', opacity: animating ? 0 : 1, width: '100%' } as any]}>
              {isRegistering && Platform.OS === 'web' ? (
                <WebRegisterForm onBackToLogin={toggleForm} />
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico:</Text>
                    <TextInput 
                      style={[
                        styles.input, 
                        { 
                          backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro, 
                          borderColor: focusedInput === 'email' ? colors.accentOrange : colors.borderColor,
                          color: colors.textMain
                        },
                        Platform.OS === 'web' && {
                          outlineStyle: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
                          ...(focusedInput === 'email' ? {
                            boxShadow: '0 0 0 2px rgba(232, 137, 60, 0.15)',
                            backgroundColor: colors.bgHover || (colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)')
                          } : {})
                        } as any
                      ]}
                      placeholder="usuario@edu.uaa.mx"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña:</Text>
                    <TextInput 
                      style={[
                        styles.input, 
                        { 
                          backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro, 
                          borderColor: focusedInput === 'password' ? colors.accentOrange : colors.borderColor,
                          color: colors.textMain
                        },
                        Platform.OS === 'web' && {
                          outlineStyle: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
                          ...(focusedInput === 'password' ? {
                            boxShadow: '0 0 0 2px rgba(232, 137, 60, 0.15)',
                            backgroundColor: colors.bgHover || (colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)')
                          } : {})
                        } as any
                      ]}
                      placeholder="******************"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: colors.accentOrange }]}>
                      Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.loginActionRow}>
                    <TouchableOpacity 
                      style={[
                        styles.loginButton, 
                        { backgroundColor: colors.accentOrange, flex: 1 },
                        Platform.OS === 'web' && {
                          backgroundImage: 'linear-gradient(to right, #e8893c, #d8aa71)',
                          boxShadow: '0 4px 14px 0 rgba(232, 137, 60, 0.39)',
                        } as any,
                        loading && { opacity: 0.7 }
                      ]} 
                      onPress={onLoginPress}
                      disabled={loading}
                    >
                      <Text style={styles.loginButtonText}>
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.helpButton, { borderColor: colors.borderColor, backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro }]}
                      onPress={() => setHelpModalVisible(true)}
                    >
                      <Ionicons name="warning" size={24} color={colors.accentOrange} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={[styles.footer, Platform.OS === 'web' && { transition: 'opacity 0.2s ease', opacity: animating ? 0 : 1 } as any]}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {isRegistering ? "¿Ya tienes cuenta? " : "¿Primera vez? "}
            </Text>
            <TouchableOpacity onPress={toggleForm}>
              <Text style={{ color: colors.accentOrange, fontSize: 14, fontWeight: '500' }}>
                {isRegistering ? "Inicia sesión" : "Regístrate gratis"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isHelpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgPanel, borderColor: colors.borderColor }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={36} color={colors.accentOrange} style={styles.modalIcon} />
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>¿Necesitas ayuda urgente?</Text>
            </View>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Si te encuentras en una situación de emergencia o presentas algún problema, por favor comunícate directamente a nuestra cuenta de Instagram:
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/michis_uaa')}>
              <Text style={[styles.instagramHandle, { color: colors.accentOrange }]}>
                @michis_uaa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro, borderColor: colors.borderColor }]}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.textMain }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  loginActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    height: 52,
    width: 52,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  instagramHandle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
