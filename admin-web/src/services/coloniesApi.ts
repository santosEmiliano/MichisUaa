import type { Colonia } from "../types/models";
import type { BackendColonia } from "../types/coloniesTypes";

const BASE_URL = "http://localhost:3000/colonies";

// Obtiene el token del localStorage
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Manejo genérico de respuestas
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.mensaje ?? data.message ?? "Error desconocido en la API de colonias");
  }
  return data as T;
}

// Mapear de BackendColonia a Frontend Colonia
function mapColonia(b: BackendColonia): Colonia {
  const primerEncargado = b.usuariosCols && b.usuariosCols.length > 0
    ? b.usuariosCols[0].usuario
    : null;

  return {
    id: b.idColonia,
    name: b.nombre,
    location: b.zona,
    description: b.descripcion,
    // El backend aún no soporta métricas de animales ni alertas, usamos valores por defecto
    alerta: false,
    animalCount: 0,
    esterilizadoPercent: 0,
    responsableId: primerEncargado ? primerEncargado.idUsuario.toString() : "",
    responsableName: primerEncargado ? primerEncargado.nombre : "Sin Encargado",
    responsableInitials: primerEncargado
      ? primerEncargado.nombre.substring(0, 2).toUpperCase()
      : "NA",
  };
}

// ── CRUD ──

export const coloniesService = {
  // GET /colonies
  getColonies: async (): Promise<Colonia[]> => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const backendData = await handleResponse<BackendColonia[]>(res);
    return backendData.map(mapColonia);
  },

  // GET /colonies/:id
  getColonyById: async (id: number): Promise<Colonia> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const backendData = await handleResponse<BackendColonia>(res);
    return mapColonia(backendData);
  },

   // POST /colonies
  createColony: async (colonia: {
    nombre: string;
    descripcion: string;
    zona: string;
    encargadosIds: number[];
  }): Promise<{ mensaje: string; colonia: BackendColonia }> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(colonia),
    });
    return handleResponse<{ mensaje: string; colonia: BackendColonia }>(res);
  },

  // PUT /colonies/:id
  updateColony: async (
    id: number,
    colonia: {
      nombre?: string;
      descripcion?: string;
      zona?: string;
      encargadosIds?: number[];
    }
  ): Promise<{ mensaje: string; colonia: BackendColonia }> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(colonia),
    });
    return handleResponse<{ mensaje: string; colonia: BackendColonia }>(res);
  },

  // DELETE /colonies/:id
  deleteColony: async (id: number): Promise<{ mensaje: string }> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ mensaje: string }>(res);
  },
};
