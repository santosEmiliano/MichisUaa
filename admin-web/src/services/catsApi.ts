import type { BackendAnimal } from "../types/models";

const API_URL = import.meta.env.VITE_API_URL || "/michisuaa/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const catsApi = {
  // Obtener todos los gatos (animales)
  getCats: async (): Promise<BackendAnimal[]> => {
    const res = await fetch(`${API_URL}/animal/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener los animales");
    return res.json();
  },
};
