import { useThemeContext } from '@/components/ThemeContext';

export function useColorScheme() {
  const { theme } = useThemeContext();
  return theme;
}

export function useSetTheme() {
  const { setTheme } = useThemeContext();
  return setTheme;
}
