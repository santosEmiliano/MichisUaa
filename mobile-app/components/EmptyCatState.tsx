import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface EmptyCatStateProps {
  message?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function EmptyCatState({ 
  message = "Parece que los michis de la zona están tomando una siesta... no hay nada por aquí.", 
  icon = "cat" 
}: EmptyCatStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={80} color={colors.textSecondary} style={styles.icon} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
    lineHeight: 22,
  },
});
