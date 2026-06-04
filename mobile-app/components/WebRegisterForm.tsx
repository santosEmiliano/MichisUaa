import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

import { handleRegister } from '@/services/authApi';
import { saveSession } from '@/services/sessionStorage';
import { registrarPushToken } from '@/hooks/useAuth';
import { showAlert } from '@/utils/alerts';

type FieldState = 'idle' | 'valid' | 'invalid';

interface Props {
  onBackToLogin: () => void;
}

export default function WebRegisterForm({ onBackToLogin }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const nombreState: FieldState = nombre.length === 0 ? 'idle' : nombre.trim().split(' ').length >= 2 ? 'valid' : 'invalid';
  const correoRegex = /^[a-zA-Z0-9._%+-]+@(edu\.uaa\.mx|uaa\.mx)$/;
  const correoState: FieldState = correo.length === 0 ? 'idle' : correoRegex.test(correo) ? 'valid' : 'invalid';
  const passwordState: FieldState = password.length === 0 ? 'idle' : password.length >= 5 ? 'valid' : 'invalid';
  const confirmPasswordState: FieldState = confirmPassword.length === 0 ? 'idle' : confirmPassword === password ? 'valid' : 'invalid';

  const getBorderColor = (state: FieldState, isFocused: boolean) => {
    if (state === 'valid') return '#4ade80';
    if (state === 'invalid') return '#f87171';
    if (isFocused) return colors.accentOrange;
    return colors.borderColor;
  };

  const getHintColor = (state: FieldState) => {
    if (state === 'valid') return '#4ade80';
    if (state === 'invalid') return '#f87171';
    return 'transparent';
  };

  const onRegisterPress = () => {
    if (nombreState !== 'valid') { showAlert("Atención", "Por favor ingresa tu nombre correctamente."); return; }
    if (correoState !== 'valid') { showAlert("Atención", "Por favor ingresa tu correo correctamente."); return; }
    if (passwordState !== 'valid') { showAlert("Atención", "Por favor ingresa tu contraseña correctamente."); return; }
    if (confirmPasswordState !== 'valid') { showAlert("Atención", "Por favor confirma tu contraseña."); return; }
    if (password !== confirmPassword) { showAlert("Atención", "Las contraseñas no coinciden."); return; }
    setShowTerms(true);
  };

  const doRegister = async () => {
    setShowTerms(false);
    setLoading(true);
    try {
      const result = await handleRegister(nombre.trim(), correo.trim(), password);
      await saveSession(result.token, result.userId, result.nombre, correo.trim());
      registrarPushToken().catch(err => console.error("Error al registrar push token:", err));
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Error al registrarse', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper para generar el estilo de los inputs en web
  const getInputStyle = (inputName: string, validationState: FieldState) => {
    const isFocused = focusedInput === inputName;
    const baseBorderColor = getBorderColor(validationState, isFocused);

    return [
      styles.input,
      {
        backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro,
        borderColor: baseBorderColor,
        color: colors.textMain,
      },
      Platform.OS === 'web' && {
        outlineStyle: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
        ...(isFocused ? {
          boxShadow: `0 0 0 2px ${validationState === 'valid' ? 'rgba(74, 222, 128, 0.15)' : validationState === 'invalid' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(232, 137, 60, 0.15)'}`,
          backgroundColor: colors.bgHover || (colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)')
        } : {})
      } as any
    ];
  };

  const getInputWrapperStyle = (inputName: string, validationState: FieldState) => {
    const isFocused = focusedInput === inputName;
    const baseBorderColor = getBorderColor(validationState, isFocused);
    return [
      styles.inputWrapper,
      {
        backgroundColor: colorScheme === 'dark' ? colors.fondoGris : colors.fondoGrisOscuro,
        borderColor: baseBorderColor,
      },
      Platform.OS === 'web' && {
        transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
        ...(isFocused ? {
          boxShadow: `0 0 0 2px ${validationState === 'valid' ? 'rgba(74, 222, 128, 0.15)' : validationState === 'invalid' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(232, 137, 60, 0.15)'}`,
          backgroundColor: colors.bgHover || (colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)')
        } : {})
      } as any
    ];
  };

  return (
    <View style={{ width: '100%' }}>
      {/* Scroll interno para los campos de registro para no hacer la tarjeta gigante en pantallas chicas */}
      <View style={{ maxHeight: 420 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre y apellido:</Text>
            <TextInput
              style={getInputStyle('nombre', nombreState)}
              value={nombre}
              onChangeText={setNombre}
              onFocus={() => setFocusedInput('nombre')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Ej. Julián Hernández"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {nombreState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons name={nombreState === 'valid' ? 'checkmark' : 'close'} size={13} color={getHintColor(nombreState)} />
                <Text style={[styles.hintText, { color: getHintColor(nombreState) }]}>
                  {nombreState === 'valid' ? 'Nombre válido' : 'Ingresa tu nombre completo'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Correo institucional:</Text>
            <TextInput
              style={getInputStyle('correo', correoState)}
              value={correo}
              onChangeText={setCorreo}
              onFocus={() => setFocusedInput('correo')}
              onBlur={() => setFocusedInput(null)}
              placeholder="al******@edu.uaa.mx"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {correoState !== 'idle' && (
              <View style={styles.hint}>
                <Ionicons name={correoState === 'valid' ? 'checkmark' : 'close'} size={13} color={getHintColor(correoState)} />
                <Text style={[styles.hintText, { color: getHintColor(correoState) }]}>
                  {correoState === 'valid' ? 'Correo disponible' : 'Debe ser un correo @edu.uaa.mx o @uaa.mx'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
            <View style={getInputWrapperStyle('password', passwordState)}>
              <TextInput
                style={[styles.inputInner, { color: colors.textMain }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
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
                <Ionicons name={passwordState === 'valid' ? 'checkmark' : 'close'} size={13} color={getHintColor(passwordState)} />
                <Text style={[styles.hintText, { color: getHintColor(passwordState) }]}>
                  {passwordState === 'valid' ? 'Mínimo 5 caracteres' : 'La contraseña es muy corta'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
            <View style={getInputWrapperStyle('confirm', confirmPasswordState)}>
              <TextInput
                style={[styles.inputInner, { color: colors.textMain }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirm')}
                onBlur={() => setFocusedInput(null)}
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
                <Ionicons name={confirmPasswordState === 'valid' ? 'checkmark' : 'close'} size={13} color={getHintColor(confirmPasswordState)} />
                <Text style={[styles.hintText, { color: getHintColor(confirmPasswordState) }]}>
                  {confirmPasswordState === 'valid' ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.accentOrange },
          Platform.OS === 'web' && {
            backgroundImage: 'linear-gradient(to right, #e8893c, #d8aa71)',
            boxShadow: '0 4px 14px 0 rgba(232, 137, 60, 0.39)',
          } as any,
          loading && { opacity: 0.7 }
        ]}
        activeOpacity={0.85}
        onPress={onRegisterPress}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Crear cuenta</Text>
        }
      </TouchableOpacity>

      {/* Términos Modal */}
      <Modal visible={showTerms} transparent animationType="fade" onRequestClose={() => setShowTerms(false)}>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.9)', borderColor: colors.borderColor },
            Platform.OS === 'web' && { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any
          ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="document-text" size={22} color="#e8893c" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Términos y Condiciones</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>MichisUAA · Comunidad de cuidado felino</Text>
              </View>
            </View>
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
                <Text style={[styles.termSection, { color: colors.textMain }]}>Conductas prohibidas y sanciones</Text>
              </View>
              <View style={[styles.termWarningBox, { borderColor: 'rgba(232,137,60,0.3)', backgroundColor: 'rgba(232,137,60,0.07)' }]}>
                <Text style={[styles.termText, { color: colors.textSecondary }]}>
                  Queda estrictamente prohibido:{`\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Subir contenido explícito, contenido ilegal, ofensivo o inapropiado para la red de una universidad. Al estar vinculado a tu correo institucional, cualquier infracción resultará en el borrado inmediato de tu cuenta y el reporte a las autoridades de la UAA para las acciones disciplinarias correspondientes.\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Subir fotografías o datos de cualquier persona sin su consentimiento explícito.\n\n`}
                  <Text style={{ color: colors.accentOrange }}>•</Text>{` Usar la plataforma con fines distintos al cuidado felino o suplantar identidades.`}
                </Text>
              </View>

              {/* Sección 4 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>4</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Canal de emergencias</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                El contacto de Instagram proporcionado en la plataforma es única y exclusivamente para atender emergencias reales de las colonias. Queda estrictamente prohibido hacer mal uso de este canal, como enviar mensajes de broma, spam o asuntos irrelevantes.
              </Text>

              {/* Sección 5 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>5</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Deslinde de responsabilidad</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                El equipo de desarrollo y los administradores de MichisUAA no se hacen responsables del uso indebido que los usuarios hagan de la plataforma. Cualquier contenido publicado es responsabilidad exclusiva de quien lo genera.
              </Text>

              {/* Sección 6 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>6</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Privacidad de datos</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary }]}>
                Los datos proporcionados al registrarse se utilizarán únicamente para identificarte dentro de la plataforma. Los datos no serán comercializados ni compartidos con terceros ajenos al funcionamiento técnico.
              </Text>

              {/* Sección 7 */}
              <View style={styles.termRow}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>7</Text></View>
                <Text style={[styles.termSection, { color: colors.textMain }]}>Aceptación</Text>
              </View>
              <Text style={[styles.termText, { color: colors.textSecondary, marginBottom: 8 }]}>
                Al presionar <Text style={{ color: colors.accentOrange, fontWeight: '600' }}>"Acepto y crear cuenta"</Text> confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad.
              </Text>
            </ScrollView>
            <View style={[styles.modalDivider, { marginBottom: 24 }]} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtnCancel, { borderColor: colors.borderColor }]} onPress={() => setShowTerms(false)}>
                <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAccept} onPress={doRegister}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalBtnAcceptText}>Acepto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { marginBottom: 10 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14 },
  inputInner: { flex: 1, paddingVertical: 12, fontSize: 15 },
  eyeIcon: { paddingLeft: 8, paddingVertical: 4 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 2 },
  hintText: { fontSize: 12, fontWeight: '500' },
  button: { borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { borderRadius: 24, borderWidth: 1, paddingHorizontal: 32, paddingTop: 32, paddingBottom: 32, width: '100%', maxWidth: 600, maxHeight: '90%', flexShrink: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  modalIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(232,137,60,0.15)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  modalSubtitle: { fontSize: 12 },
  modalDivider: { height: 1.5, backgroundColor: '#e8893c', opacity: 0.25, marginBottom: 12 },
  modalScroll: { flexShrink: 1, marginBottom: 24 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 6 },
  termBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e8893c', justifyContent: 'center', alignItems: 'center' },
  termBadgeDanger: { backgroundColor: '#c0392b' },
  termBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  termSection: { fontSize: 14, fontWeight: '700', flex: 1 },
  termText: { fontSize: 13, lineHeight: 20 },
  termWarningBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 4 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalBtnCancelText: { fontSize: 14, fontWeight: '600' },
  modalBtnAccept: { flex: 2, backgroundColor: '#e8893c', borderRadius: 12, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalBtnAcceptText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
