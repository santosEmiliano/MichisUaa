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

export {
  getSightingsByUser,
};