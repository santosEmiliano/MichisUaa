import type { LoginResponse, CreateUserResponse } from "../types/authTypes";

const BASE_URL = "/michisuaa/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje ?? data.message ?? "Error desconocido");
  }
  return data as T;
}

export const authService = {

  /**
   * POST /user/register
  */
  createUser: async (
    nombre: string,
    email: string,
    password: string,
    admin: boolean
  ): Promise<CreateUserResponse> => {
    const res = await fetch(`${BASE_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, email, password, admin }),
    });
    return handleResponse<CreateUserResponse>(res);
  },

  /**
   * POST /user/login
  */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(res);
  },

  /**
   * POST /user/logout
  */
  logout: async (): Promise<void> => {
    await fetch(`${BASE_URL}/user/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
