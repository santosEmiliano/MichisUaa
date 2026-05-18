import { BASE_URL } from "./api";

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/login`, {
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

const handleRegister = async (userName: string, userEmail: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: userName,
        email: userEmail,
        password: password,
      }),
    });

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

export {
  handleLogin,
  handleRegister,
};
