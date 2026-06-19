import { BASE_URL } from "./api";
import { Platform } from "react-native";

const handleLogin = async (email: string, password: string) => {
  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    };
    if (Platform.OS === "web") {
      fetchOptions.credentials = "include";
    }

    const response = await fetch(`${BASE_URL}/user/login`, fetchOptions);

    const data = await response.json();

    if (response.ok && data.token) {
      return data;
    } else {
      throw new Error(data.mensaje || "Credenciales inválidas");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de conexión al servidor");
  }
};

const handleRegister = async (userName: string, userEmail: string, password: string) => {
  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: userName,
        email: userEmail,
        password: password,
      }),
    };
    if (Platform.OS === "web") {
      fetchOptions.credentials = "include";
    }

    const response = await fetch(`${BASE_URL}/user/register`, fetchOptions);

    const data = await response.json();

    if (response.ok && data.token) {
      return data;
    } else {
      throw new Error(data.mensaje || data.message || "Error al registrarse");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de conexión al servidor");
  }
};

const handleLogout = async () => {
  if (Platform.OS === "web") {
    try {
      await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    }
  }
};

export {
  handleLogin,
  handleRegister,
  handleLogout,
};