import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type FieldState = 'idle' | 'valid' | 'invalid';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones de inputs
  const nombreState: FieldState =
    nombre.length === 0 ? 'idle' : nombre.trim().split(' ').length >= 2 ? 'valid' : 'invalid';
 
  const correoRegex = /^[a-zA-Z0-9._%+-]+@(edu\.uaa\.mx|uaa\.mx)$/;
  const correoState: FieldState =
    correo.length === 0 ? 'idle' : correoRegex.test(correo) ? 'valid' : 'invalid';

  const passwordState: FieldState =
    password.length === 0 ? 'idle' : password.length >= 5 ? 'valid' : 'invalid';

  const confirmPasswordState: FieldState = confirmPassword.length === 0 ? 'idle' : confirmPassword === password ? 'valid' : 'invalid';

  // Colores de los inputs por estado
  const getBorderColor = (state: FieldState) => {
    if (state === 'valid') return '#4ade80';
    if (state === 'invalid') return '#f87171';
    return colors.borderColor;
  };

  const getHintColor = (state: FieldState) => {
    if (state === 'valid') return '#4ade80';
    if (state === 'invalid') return '#f87171';
    return 'transparent';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bgDark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header con el botón de regreso */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={[styles.backCircle, { backgroundColor: colors.fondoGris }]}>
            <Ionicons name="chevron-back" size={20} color={colors.textMain} />
          </View>
          <Text style={[styles.backText, { color: colors.textMain }]}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.textMain }]}>Únete a MichisUAA</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ayuda a cuidar las colonias del campus
          </Text>
        </View>

        {/* Tarjeta de formulario */}
        <View style={[styles.card, { backgroundColor: colors.fondoGrisOscuro, borderColor: colors.borderColor }]}>

          {/* Nombre completo */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre y apellido:</Text>
            <TextInput
              style={[styles.input, { borderColor: getBorderColor(nombreState), color: colors.textMain, backgroundColor: colors.fondoGris }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Julián Hernández"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {nombreState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons
                  name={nombreState === 'valid' ? 'checkmark' : 'close'}
                  size={13}
                  color={getHintColor(nombreState)}
                />
                <Text style={[styles.hintText, { color: getHintColor(nombreState) }]}>
                  {nombreState === 'valid' ? 'Nombre válido' : 'Ingresa tu nombre completo'}
                </Text>
              </View>
            )}
          </View>

          {/* Correo institucional */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Correo institucional:</Text>
            <TextInput
              style={[styles.input, { borderColor: getBorderColor(correoState), color: colors.textMain, backgroundColor: colors.fondoGris }]}
              value={correo}
              onChangeText={setCorreo}
              placeholder="al******@edu.uaa.mx"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {correoState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons
                  name={correoState === 'valid' ? 'checkmark' : 'close'}
                  size={13}
                  color={getHintColor(correoState)}
                />
                <Text style={[styles.hintText, { color: getHintColor(correoState) }]}>
                  {correoState === 'valid' ? 'Correo disponible' : 'Debe ser un correo @edu.uaa.mx o @uaa.mx'}
                </Text>
              </View>
            )}
          </View>

          {/* Contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
            <View style={[styles.inputWrapper, { borderColor: getBorderColor(passwordState), backgroundColor: colors.fondoGris }]}>
              <TextInput
                style={[styles.inputInner, { color: colors.textMain }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 5 caracteres"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {passwordState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons
                  name={passwordState === 'valid' ? 'checkmark' : 'close'}
                  size={13}
                  color={getHintColor(passwordState)}
                />
                <Text style={[styles.hintText, { color: getHintColor(passwordState) }]}>
                  {passwordState === 'valid' ? 'Mínimo 5 caractéres' : 'La contraseña es muy corta'}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
            <View style={[styles.inputWrapper, { borderColor: getBorderColor(confirmPasswordState), backgroundColor: colors.fondoGris }]}>
              <TextInput
                style={[styles.inputInner, { color: colors.textMain }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {confirmPasswordState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons
                  name={confirmPasswordState === 'valid' ? 'checkmark' : 'close'}
                  size={13}
                  color={getHintColor(confirmPasswordState)}
                />
                <Text style={[styles.hintText, { color: getHintColor(confirmPasswordState) }]}>
                  {confirmPasswordState === 'valid' ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              </View>
            )}
          </View>

          {/* Botón de registro */}
          <TouchableOpacity style={styles.button} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Link a login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: colors.accentOrange }]}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  backCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 4,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeIcon: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 2,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#e8893c',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
