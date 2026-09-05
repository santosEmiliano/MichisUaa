import { Platform } from "react-native";
import { router } from "expo-router";
import {
  getSession,
  clearSession,
  updateAccessToken,
  COOKIE_SESSION,
} from "./sessionStorage";
import { alertService } from "@/services/alertService";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://ccbas.uaa.mx/michisuaa/api";

let isNavigatingToLogin = false;

// Una sola renovación en vuelo a la vez. El mapa y la pantalla de avistamientos
// hacen polling cada 30 s, así que al vencer el token varias peticiones reciben
// 401 casi simultáneamente y no deben disparar una renovación cada una.
let refrescoEnCurso: Promise<boolean> | null = null;

async function pedirTokenNuevo(): Promise<boolean> {
  const session = await getSession();

  // En nativo el refresh token se manda en el cuerpo; en web viaja solo, en la
  // cookie httpOnly, y por eso basta con `credentials: include`.
  if (Platform.OS !== "web" && !session?.refreshToken) return false;

  const opciones: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session?.refreshToken ? { token: session.refreshToken } : {}),
  };
  if (Platform.OS === "web") {
    opciones.credentials = "include";
  }

  const response = await fetch(`${BASE_URL}/user/refresh`, opciones);
  if (!response.ok) return false;

  const data = await response.json();
  if (data?.token) {
    await updateAccessToken(data.token);
  }
  return true;
}

/** Renueva el token de acceso. Devuelve false si la sesión ya no es recuperable. */
export async function refrescarSesion(): Promise<boolean> {
  if (!refrescoEnCurso) {
    refrescoEnCurso = pedirTokenNuevo()
      .catch(() => false)
      .finally(() => {
        refrescoEnCurso = null;
      });
  }
  return refrescoEnCurso;
}

/** Cierra la sesión local y manda al login. Se avisa una sola vez. */
export async function manejarSesionExpirada(): Promise<void> {
  if (isNavigatingToLogin) return;
  isNavigatingToLogin = true;

  // Si no había sesión guardada, el usuario nunca entró: mandarlo al login sin
  // decirle que "expiró" algo que nunca tuvo.
  const habiaSesion = (await getSession()) !== null;

  await clearSession();

  if (habiaSesion) {
    alertService.error(
      "Sesión expirada",
      "Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo.",
      "high"
    );
  }

  router.replace("/login");

  setTimeout(() => {
    isNavigatingToLogin = false;
  }, 2000);
}

// Lee la sesión en cada intento, para que el reintento posterior a una
// renovación use ya el token nuevo.
async function ejecutar(endpoint: string, options: RequestInit): Promise<Response> {
  const session = await getSession();

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token && session.token !== COOKIE_SESSION
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
      ...options.headers,
    },
  };

  if (Platform.OS === "web") {
    fetchOptions.credentials = "include";
  }

  return fetch(`${BASE_URL}${endpoint}`, fetchOptions);
}

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    let response = await ejecutar(endpoint, options);

    if (response.status === 401) {
      // El token de acceso dura 1 h. Antes de tirar la sesión se intenta
      // renovarlo con el refresh token (7 días) y repetir la petición.
      const renovado = await refrescarSesion();
      if (renovado) {
        response = await ejecutar(endpoint, options);
      }

      if (response.status === 401) {
        await manejarSesionExpirada();
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
