import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  TOKEN: "auth_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER_ID: "auth_user_id",
  USER_NAME: "auth_user_name",
  USER_EMAIL: "auth_user_email",
};

// Valor centinela que usa la web: ahí el token real vive en una cookie httpOnly
// que el JS no puede leer, así que solo se marca que hay sesión abierta.
export const COOKIE_SESSION = "cookie-session-active";

async function save(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function get(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function remove(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// funciones de guardado de sessionStorage

// Guarda el token, el userId, userName y userEmail tras un login exitoso.
// En nativo se guarda además el refreshToken, que es lo que permite renovar la
// sesión sin volver a pedir credenciales; en web ese token viaja en cookie.
export async function saveSession(
  token: string,
  userId: number,
  userName: string,
  userEmail: string,
  refreshToken?: string
): Promise<void> {
  const saves = [
    save(KEYS.USER_ID, String(userId)),
    save(KEYS.USER_NAME, userName),
    save(KEYS.USER_EMAIL, userEmail),
  ];

  if (Platform.OS !== "web") {
    saves.push(save(KEYS.TOKEN, token));
    if (refreshToken) {
      saves.push(save(KEYS.REFRESH_TOKEN, refreshToken));
    }
  }

  await Promise.all(saves);
}

// Reemplaza solo el token de acceso, tras renovarlo contra /user/refresh.
// En web no hace nada: el backend reemplaza la cookie por su cuenta.
export async function updateAccessToken(token: string): Promise<void> {
  if (Platform.OS === "web") return;
  await save(KEYS.TOKEN, token);
}

// Recupera la sesión almacenada.
// Devuelve null si no existe ninguna sesión activa.
export async function getSession(): Promise<{
  token: string;
  refreshToken: string | null;
  userId: string;
  userName: string;
  userEmail: string;
} | null> {
  const [userId, userName, userEmail] = await Promise.all([
    get(KEYS.USER_ID),
    get(KEYS.USER_NAME),
    get(KEYS.USER_EMAIL),
  ]);

  let token: string | null = COOKIE_SESSION;
  let refreshToken: string | null = null;
  if (Platform.OS !== "web") {
    [token, refreshToken] = await Promise.all([
      get(KEYS.TOKEN),
      get(KEYS.REFRESH_TOKEN),
    ]);
  }

  if (!token || !userId || !userName || !userEmail) return null;

  return { token, refreshToken, userId, userName, userEmail };
}

// Elimina la sesión guardada (logout local).

export async function clearSession(): Promise<void> {
  await Promise.all([
    remove(KEYS.TOKEN),
    remove(KEYS.REFRESH_TOKEN),
    remove(KEYS.USER_ID),
    remove(KEYS.USER_NAME),
    remove(KEYS.USER_EMAIL),
  ]);
}
