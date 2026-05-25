import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, useWindowDimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';
import { router } from 'expo-router';

// Servicios
import { handleLogin } from '@/services/authApi';
import { saveSession, getSession } from '@/services/sessionStorage';
import { registrarPushToken } from '@/hooks/useAuth';

// Utils
import { showAlert } from '@/utils/alerts';
import WebBackground from '@/components/WebBackground';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { height, width } = useWindowDimensions();

  // Escala dinámica para web:
  // Si la ventana mide menos de 850px de alto o 450px de ancho, el contenedor se encogerá proporcionalmente.
  const scale = Platform.OS === 'web' ? Math.min(1, height / 850, width / 450) : 1;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

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
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/MichisUAALogo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.textMain }]}>MichisUAA</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Colonias felinas del campus</Text>
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

            <TouchableOpacity 
              style={[
                styles.loginButton, 
                { backgroundColor: colors.accentOrange },
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
          </View>

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>¿Primera vez? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={{ color: colors.accentOrange, fontSize: 14, fontWeight: '500' }}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
