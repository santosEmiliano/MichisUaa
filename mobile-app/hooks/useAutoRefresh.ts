import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

/** Hook reutilizable del polling con detección de estado
 * - Hace fetch inicial
 * - Repite el fetch cada  30 segundos
 */

export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref para tener siempre la versión más reciente de fetchFn
  const fetchRef = useRef(fetchFn);
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchRef.current();
    }, intervalMs);
  }, [intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fetch inicial
    fetchRef.current();
    startPolling();

    if (Platform.OS === 'web') {
      // ── WEB: Visibility API ──────────────────────────────────────────────
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // El usuario fue a otra pestaña
          stopPolling();
        } else {
          // El usuario volvió
          fetchRef.current();
          startPolling();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // ── iOS / Android: AppState ───────────────────────────────────
      const handleAppStateChange = (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          // La app volvió al frente
          fetchRef.current();
          startPolling();
        } else {
          // La app se fue al background o está inactiva
          stopPolling();
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        stopPolling();
        subscription.remove();
      };
    }
  }, [enabled, startPolling, stopPolling]);
}
