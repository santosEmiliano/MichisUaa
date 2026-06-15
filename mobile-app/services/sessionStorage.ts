import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  TOKEN: "auth_token",
  USER_ID: "auth_user_id",
  USER_NAME: "auth_user_name",
  USER_EMAIL: "auth_user_email",
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

// Guarda el token, el userId, userName y userEmail tras un login exitoso.
export async function saveSession(
  token: string,
  userId: number,
  userName: string,
  userEmail: string
): Promise<void> {
  const saves = [
    save(KEYS.USER_ID, String(userId)),
    save(KEYS.USER_NAME, userName),
    save(KEYS.USER_EMAIL, userEmail),
  ];
  
  if (Platform.OS !== "web") {
    saves.push(save(KEYS.TOKEN, token));
  }
  
  await Promise.all(saves);
}

// Recupera la sesión almacenada. 
// Devuelve null si no existe ninguna sesión activa.
export async function getSession(): Promise<{
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
} | null> {
  const [userId, userName, userEmail] = await Promise.all([
    get(KEYS.USER_ID),
    get(KEYS.USER_NAME),
    get(KEYS.USER_EMAIL),
  ]);

  let token: string | null = "cookie-session-active";
  if (Platform.OS !== "web") {
    token = await get(KEYS.TOKEN);
  }

  if (!token || !userId || !userName || !userEmail) return null;

  return { token, userId, userName, userEmail };
}

// Elimina la sesión guardada (logout local).

export async function clearSession(): Promise<void> {
  const removals = [
    remove(KEYS.USER_ID),
    remove(KEYS.USER_NAME),
    remove(KEYS.USER_EMAIL),
  ];
  
  if (Platform.OS !== "web") {
    removals.push(remove(KEYS.TOKEN));
  }
  
  await Promise.all(removals);
}
