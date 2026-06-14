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
      console.log("🔄 [AutoRefresh MOBILE] Polling cada 30s ejecutado");
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
          console.log("⏸️ [AutoRefresh MOBILE-WEB] Pestaña oculta, pausando polling");
          stopPolling();
        } else {
          console.log("▶️ [AutoRefresh MOBILE-WEB] Pestaña visible, haciendo fetch inmediato");
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
          console.log("▶️ [AutoRefresh MOBILE-NATIVO] App en Foreground, haciendo fetch inmediato");
          fetchRef.current();
          startPolling();
        } else {
          console.log(`⏸️ [AutoRefresh MOBILE-NATIVO] App en Background (estado: ${nextState}), pausando polling`);
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
