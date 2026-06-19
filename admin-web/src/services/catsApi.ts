import type { BackendAnimal } from "../types/models";

const API_URL = import.meta.env.VITE_API_URL || "/michisuaa/api";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const catsApi = {
  // Obtener todos los gatos (animales)
  getCats: async (): Promise<BackendAnimal[]> => {
    const res = await fetch(`${API_URL}/animal/`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener los animales");
    return res.json();
  },
};
