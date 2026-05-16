import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';
import { router } from 'expo-router';

// Servicios
import { handleLogin } from '@/services/authApi';
import { saveSession, getSession } from '@/services/sessionStorage';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para mostrar alertas compatibles con Web y Móvil
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
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
      await saveSession(result.token, result.datos.id, result.datos.nombre);

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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
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
          <View style={[styles.card, { backgroundColor: colors.bgPanel, borderColor: colors.borderColor }]}>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico:</Text>
              <TextInput 
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro, 
                    borderColor: colors.borderColor,
                    color: colors.textMain
                  }
                ]}
                placeholder="usuario@edu.uaa.mx"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
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
                    borderColor: colors.borderColor,
                    color: colors.textMain
                  }
                ]}
                placeholder="******************"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
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
    padding: 24,
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
