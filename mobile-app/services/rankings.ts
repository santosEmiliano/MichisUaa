import { apiFetch } from "./api";

const getTopRankings = async () => {
  try {
    const response = await apiFetch("/avistamientos/ranking");
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error al obtener el ranking general:", error);
    return [];
  }
};

export {
  getTopRankings,
};
