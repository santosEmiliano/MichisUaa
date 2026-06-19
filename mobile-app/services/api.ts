import { Platform } from "react-native";
import { router } from "expo-router";
import { getSession, clearSession } from "./sessionStorage";
import { alertService } from "@/services/alertService";

const BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP;

let isNavigatingToLogin = false;

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://ccbas.uaa.mx/michisuaa/api";

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const session = await getSession();

  try {
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
        alertService.error("Sesión expirada", "Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo.", "high");
        router.replace("/login");

        setTimeout(() => {
          isNavigatingToLogin = false;
        }, 2000);
      }
    }

    return response;
  } catch (error: any) {
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      alertService.error("Error de Servidor", "No pudimos comunicarnos con el servidor de MichisUAA. Por favor, verifica tu conexión a internet o intenta más tarde.");
    }
    throw error;
  }
};