import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgDark, paddingTop: insets.top }]}>
      {/* Botón de regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={[styles.backCircle, { backgroundColor: colors.fondoGris }]}>
          <Ionicons name="chevron-back" size={20} color={colors.textMain} />
        </View>
        <Text style={[styles.backText, { color: colors.textMain }]}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Contenido */}
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.accentOrange }]}>Registro</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
