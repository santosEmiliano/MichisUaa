import type { User } from "../types/models";
import type { BackendUser, DeleteUserResponse, UpdateUserResponse } from "../types/userTypes";

const BASE_URL = "/michisuaa/api/user";

// Obtiene el token del localStorage
const getAuthHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  };
};

// Manejo genérico de respuestas
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.mensaje ?? data.message ?? "Error desconocido en la API de usuarios");
  }
  return data as T;
}

function mapUser(b: BackendUser): User {
    const iniciales = b.nombre
        .split(" ")
        .map(p => p.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    const colors = ["#7a5c2e", "#2e5c4a", "#2e4a7a", "#5c2e2e", "#4a2e7a", "#7a4a2e"];
    const hash = b.nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colorAvatar = colors[hash % colors.length];
    const fecha = new Date(b.createdAt);
    const mes = fecha.toLocaleString("es-ES", { month: "long" });
    const creadoEn = `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fecha.getFullYear()}`;
    return {
        id: b.idUsuario,
        nombre: b.nombre,
        email: b.email,
        iniciales,
        colorAvatar,
        rol: b.admin ? "Administrador" : "Simpatizante",
        coloniasAsignadas: b.usuariosCols?.map(uc => uc.colonia.nombre) ?? [],
        creadoEn,
    };
}

export const userService = {
    // GET /user
   getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${BASE_URL}`, {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        const backendData = await handleResponse<BackendUser[]>(res);
        const users = backendData.map(data => mapUser(data));
        return users;
    },

    // PUT /user/:id
    updateUser: async (
        id: number,
        usuario: {
            nombre?: string,
            email?: string,
            password?: string,
            admin?: boolean
            coloniasIds?: number[];
        }
        ): Promise<UpdateUserResponse> => {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
        credentials: "include",
            body: JSON.stringify(usuario),
        });
        return handleResponse<UpdateUserResponse>(res);
    },

    // DELETE /user/:id
    deleteUser: async (id: number): Promise<DeleteUserResponse> => {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        credentials: "include",
        });
        return handleResponse<DeleteUserResponse>(res);
    },
}