import { apiFetch } from "./api";
import { getSession } from "./sessionStorage";

const getSightingsByUser = async () => {
  try {
    const session = await getSession();
    const response = await apiFetch(`/avistamientos/?idUsuario=${session?.userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener avistamientos:", error);
  }
};

const getUserRanking = async (userId: string | number) => {
  try {
    const response = await apiFetch(`/avistamientos/ranking/${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener ranking del usuario:", error);
    return null;
  }
};

export {
  getSightingsByUser,
  getUserRanking,
};