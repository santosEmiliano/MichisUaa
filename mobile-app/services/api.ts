import { Platform } from "react-native";
import { getSession } from "./sessionStorage";

const BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP;

export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : `http://${BACKEND_IP}:3000`;

/**
 * Wrapper de fetch autenticado para el backend de MichisUAA.
 * Agrega automáticamente el token JWT desde SecureStore.
 *
 * @example
 * const res = await apiFetch('/animal/public');
 * const res = await apiFetch('/avistamientos', { method: 'POST', body: JSON.stringify(data) });
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const session = await getSession();

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });
};
