import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Services
import { handleRegister } from '@/services/authApi';
import { saveSession } from '@/services/sessionStorage';
import { registrarPushToken } from '@/hooks/useAuth';

// Utils
import { alertService } from '@/services/alertService';

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
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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

  const onRegisterPress = () => {
    if (nombreState !== 'valid') { alertService.warning("Atención", "Por favor ingresa tu nombre correctamente."); return; }
    if (correoState !== 'valid') { alertService.warning("Atención", "Por favor ingresa tu correo correctamente."); return; }
    if (passwordState !== 'valid') { alertService.warning("Atención", "Por favor ingresa tu contraseña correctamente."); return; }
    if (confirmPasswordState !== 'valid') { alertService.warning("Atención", "Por favor confirma tu contraseña."); return; }
    if (password !== confirmPassword) { alertService.warning("Atención", "Las contraseñas no coinciden."); return; }
    // Si todo está bien, muestra el modal de T&C
    setShowTerms(true);
  };

  // Se llama al aceptar los T&C
  const doRegister = async () => {
    setShowTerms(false);
    setLoading(true);
    try {
      const result = await handleRegister(nombre.trim(), correo.trim(), password);
      await saveSession(result.token, result.userId, result.nombre, correo.trim());
      registrarPushToken().catch(err => console.error("Error al registrar push token:", err));
      alertService.success("¡Cuenta Creada!", "Te has registrado exitosamente. ¡Bienvenido a MichisUAA!");
      router.replace('/(tabs)');
    } catch (error: any) {
      alertService.error('Error al registrarse', error.message);
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={onRegisterPress}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Crear cuenta</Text>
            }
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

      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.fondoGrisOscuro, borderColor: colors.borderColor }]}>

            {/* Drag handle */}
            <View style={[styles.dragHandle, { backgroundColor: colors.borderColor }]} />

            {/* Header con ícono naranja */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="document-text" size={22} color="#e8893c" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Términos y Condiciones</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>MichisUAA · Comunidad de cuidado felino</Text>
              </View>
            </View>

            {/* Divider naranja */}
            <View style={styles.modalDivider} />

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

              {/* Sección 1 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>1</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Propósito de la aplicación</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                MichisUAA es una plataforma comunitaria destinada exclusivamente al registro, seguimiento y cuidado de las colonias felinas dentro del campus de la Universidad Autónoma de Aguascalientes. Su uso es estrictamente benéfico y de carácter universitario.
              </Text>

              {/* Sección 2 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>2</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Uso aceptable</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                El usuario se compromete a utilizar la aplicación de forma responsable. Está permitido: reportar avistamientos de gatos del campus, consultar información de las colonias y colaborar con los administradores de la comunidad.
              </Text>

              {/* Sección 3 — Destacada */}
              <View style={styles.termRow}>
                <View style={[styles.termBadge, styles.termBadgeDanger]}><Text style={styles.termBadgeText}>3</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Conductas prohibidas</Text>
              </View>
              <View style={[styles.termWarningBox, { borderColor: 'rgba(232,137,60,0.3)', backgroundColor: 'rgba(232,137,60,0.07)' }]}>
                <Text style={[styles.termText, { color: colors.textSecondary }]}>
                  Queda estrictamente prohibido:{`\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Subir fotografías, datos personales o cualquier información identificable de cualquier persona —sea o no miembro de la universidad— sin su consentimiento explícito.\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Publicar, compartir o almacenar contenido explícito, ilegal, ofensivo, discriminatorio o que atente contra la dignidad de cualquier persona.\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Usar la plataforma con fines distintos al cuidado y monitoreo felino.\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Suplantar identidades o crear cuentas falsas.`}
                </Text>
              </View>

              {/* Sección 4 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>4</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Deslinde de responsabilidad</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                El equipo de desarrollo y los administradores de MichisUAA no se hacen responsables del uso indebido que los usuarios hagan de la plataforma. Cualquier contenido publicado es responsabilidad exclusiva de quien lo genera. El incumplimiento de estos términos puede resultar en la suspensión inmediata de la cuenta y, de ser necesario, en el reporte a las autoridades universitarias competentes.
              </Text>

              {/* Sección 5 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>5</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Privacidad de datos</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                Los datos proporcionados al registrarse (nombre y correo institucional) se utilizarán únicamente para identificarte dentro de la plataforma. Los datos no serán comercializados ni compartidos con terceros ajenos al funcionamiento técnico de la plataforma.
              </Text>

              {/* Sección 6 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>6</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Aceptación</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary, marginBottom: 8 }]}>
                Al presionar <Text style={{ color: colors.accentOrange, fontWeight: '600' }}>"Acepto y crear cuenta"</Text> confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad.
              </Text>

            </ScrollView>

            {/* Botones */}
            <View style={[styles.modalDivider, { marginBottom: 16 }]} />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.borderColor }]}
                onPress={() => setShowTerms(false)}
              >
                <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAccept} onPress={doRegister}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalBtnAcceptText}>Acepto y crear cuenta</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

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

  // Modal de Términos y Condiciones
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(232,137,60,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
  },
  modalDivider: {
    height: 1.5,
    backgroundColor: '#e8893c',
    opacity: 0.25,
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 360,
    marginBottom: 8,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 6,
  },
  termBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e8893c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termBadgeDanger: {
    backgroundColor: '#c0392b',
  },
  termBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  termSection: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  termText: {
    fontSize: 13,
    lineHeight: 20,
  },
  termWarningBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnAccept: {
    flex: 2,
    backgroundColor: '#e8893c',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnAcceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
