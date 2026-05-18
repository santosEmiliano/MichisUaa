import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CatAvatarProps {
  initials: string;
  size?: number;
}

export default function CatAvatar({ initials, size = 64 }: CatAvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const earSize = size * 0.31;
  const innerEarSize = earSize * 0.5;

  return (
    <View style={[styles.avatarWrapper, { width: size, height: size }]}>
      {/* Oreja Izquierda */}
      <View style={[
        styles.catEar, 
        styles.leftEar, 
        { backgroundColor: colors.accentOrange, width: earSize, height: earSize }
      ]}>
        <View style={[styles.innerEar, { width: innerEarSize, height: innerEarSize }]} />
      </View>
      {/* Oreja Derecha */}
      <View style={[
        styles.catEar, 
        styles.rightEar, 
        { backgroundColor: colors.accentOrange, width: earSize, height: earSize }
      ]}>
        <View style={[styles.innerEar, { width: innerEarSize, height: innerEarSize }]} />
      </View>
      {/* Círculo Principal del Avatar */}
      <View style={[
        styles.avatar, 
        { backgroundColor: colors.accentOrange, width: size, height: size, borderRadius: size / 2 }
      ]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.375 }]}>{initials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrapper: {
    position: 'relative',
  },
  catEar: {
    position: 'absolute',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  leftEar: {
    top: -3,
    left: 6,
    transform: [{ rotate: '25deg' }],
  },
  rightEar: {
    top: -3,
    right: 6,
    transform: [{ rotate: '65deg' }],
  },
  innerEar: {
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
