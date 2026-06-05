import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

let webTheme: 'light' | 'dark' | null = null;
const listeners = new Set<(scheme: 'light' | 'dark') => void>();

try {
  const stored = localStorage.getItem('app_theme');
  if (stored === 'light' || stored === 'dark') {
    webTheme = stored;
  }
} catch (e) {}

export function setColorScheme(scheme: 'light' | 'dark') {
  webTheme = scheme;
  try {
    localStorage.setItem('app_theme', scheme);
  } catch (e) {}
  listeners.forEach(listener => listener(scheme));
}

export function useColorScheme() {
  const nativeScheme = useNativeColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<'light' | 'dark'>(webTheme ?? nativeScheme);

  // Sincronizar con el tema del sistema si el usuario no ha elegido uno manualmente
  useEffect(() => {
    if (!webTheme) {
      setScheme(nativeScheme);
    }
  }, [nativeScheme]);

  useEffect(() => {
    const handler = (newScheme: 'light' | 'dark') => setScheme(newScheme);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return scheme;
}
