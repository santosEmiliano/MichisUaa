import type { BackendAvistamiento } from "../types/models";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getUserId = (): number | null => {
  const id = localStorage.getItem("userId");
  return id ? Number(id) : null;
};

export const avistamientosApi = {
  // Obtener todos los avistamientos
  getAvistamientos: async (): Promise<BackendAvistamiento[]> => {
    const res = await fetch(`${API_URL}/avistamientos`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener los avistamientos");
    return res.json();
  },


  // Rechazar un avistamiento
  rechazarAvistamiento: async (id: number) => {
    // Para rechazar, enviamos verificado en false pero con el ID del admin que procesó el reporte
    const res = await fetch(`${API_URL}/avistamientos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ 
        verificado: false,
        verificadoPor: getUserId() || 1
      }),
    });
    if (!res.ok) throw new Error("Error al rechazar el avistamiento");
    return res.json();
  },

  // Quitar el rechazo de un avistamiento (Quitar el verificado por)
  revocarRechazoAvistamiento: async (id: number) => {
    // Para rechazar, enviamos verificado en false pero con el ID del admin que procesó el reporte
    const res = await fetch(`${API_URL}/avistamientos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ 
        verificado: false,
        verificadoPor: null
      }),
    });
    if (!res.ok) throw new Error("Error al rechazar el avistamiento");
    return res.json();
  },

  // Modificar animal de un avistamiento ya verificado
  modificarAnimalAvistamiento: async (id: number, animalId: number) => {
    const res = await fetch(`${API_URL}/avistamientos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ animalId }),
    });
    if (!res.ok) throw new Error("Error al modificar el avistamiento");
    return res.json();
  },

  // Revocar verificacion (regresa a pendiente)
  revocarVerificacion: async (id: number) => {
    const res = await fetch(`${API_URL}/avistamientos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        verificado: false,
        verificadoPor: null,
      }),
    });
    if (!res.ok) throw new Error("Error al revocar la verificación");
    return res.json();
  },

  // Eliminar un avistamiento
  deleteAvistamiento: async (id: number) => {
    const res = await fetch(`${API_URL}/avistamientos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar el avistamiento");
    return res.json();
  },
};
