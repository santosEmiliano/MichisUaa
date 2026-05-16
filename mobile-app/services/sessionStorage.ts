import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  TOKEN: "auth_token",
  USER_ID: "auth_user_id",
  USER_NAME: "auth_user_name",
};

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

// Guarda el token, el userId y el userName tras un login exitoso.
export async function saveSession(
  token: string,
  userId: number,
  userName: string
): Promise<void> {
  await Promise.all([
    save(KEYS.TOKEN, token),
    save(KEYS.USER_ID, String(userId)),
    save(KEYS.USER_NAME, userName),
  ]);
}

// Recupera la sesión almacenada. 
// Devuelve null si no existe ninguna sesión activa.
export async function getSession(): Promise<{
  token: string;
  userId: string;
  userName: string;
} | null> {
  const [token, userId, userName] = await Promise.all([
    get(KEYS.TOKEN),
    get(KEYS.USER_ID),
    get(KEYS.USER_NAME),
  ]);

  if (!token || !userId || !userName) return null;

  return { token, userId, userName };
}

// Elimina la sesión guardada (logout local).

export async function clearSession(): Promise<void> {
  await Promise.all([
    remove(KEYS.TOKEN),
    remove(KEYS.USER_ID),
    remove(KEYS.USER_NAME),
  ]);
}
