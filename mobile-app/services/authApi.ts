import { Platform } from "react-native";

const BACKEND_HOST_IP = "192.168.1.98";

const handleLogin = async (email: string, password: string) => {
  const API_URL = Platform.OS === "web" ? "http://localhost:3000" : `http://${BACKEND_HOST_IP}:3000`;

  try {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

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

export { handleLogin };
