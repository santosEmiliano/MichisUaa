import type { Cat } from "../types/models";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const catsApi = {
  // Obtener todos los gatos
  getCats: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/animal/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener los animales");
    return res.json();
  },
  
  // Puedes agregar más métodos CRUD aquí si es necesario (create, update, delete)
};
