import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance, useColorScheme as useNativeColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const nativeScheme = useNativeColorScheme() ?? 'dark';
  const [theme, setThemeState] = useState<Theme>(nativeScheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let stored = null;
        if (Platform.OS === 'web') {
          stored = localStorage.getItem('app_theme');
        } else {
          stored = await AsyncStorage.getItem('app_theme');
        }

        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored as Theme);
          if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
            Appearance.setColorScheme(stored as Theme);
          }
        } else {
          setThemeState(nativeScheme as Theme);
        }
      } catch (e) {
        console.warn('Error loading theme', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [nativeScheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(newTheme);
    }
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('app_theme', newTheme);
      } else {
        await AsyncStorage.setItem('app_theme', newTheme);
      }
    } catch (e) {
      console.warn('Error saving theme', e);
    }
  }, []);

  // Para evitar flickering (parpadeo de tema) antes de cargar, renderizamos null hasta saber qué tema es
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
