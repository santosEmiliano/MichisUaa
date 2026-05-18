import { Platform } from "react-native";
import { router } from "expo-router";
import { getSession, clearSession } from "./sessionStorage";
import { showAlert } from "@/utils/alerts";

const BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP;

let isNavigatingToLogin = false;

export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : `http://${BACKEND_IP}:3000`;

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const session = await getSession();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (!isNavigatingToLogin) {
      isNavigatingToLogin = true;
      await clearSession();
      showAlert("Sesión expirada", "Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo.");
      router.replace("/login");

      setTimeout(() => {
        isNavigatingToLogin = false;
      }, 2000);
    }
  }

  return response;
};