import { Appearance, useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  return useNativeColorScheme() ?? 'light';
}

export function setColorScheme(scheme: 'light' | 'dark') {
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(scheme);
  }
}
