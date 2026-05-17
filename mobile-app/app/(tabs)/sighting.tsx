import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function SightingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Interfaz de avistamiento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.tint,
  },
});
