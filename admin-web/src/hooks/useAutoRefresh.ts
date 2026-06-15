import { useEffect, useRef, useCallback } from "react";

//Hook para el polling con Visibility API.

export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guardamos la referencia más reciente de fetchFn para no reiniciar el efecto si cambia
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

    // Visibility API: pausa cuando la pestaña no está visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchRef.current();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);
}
