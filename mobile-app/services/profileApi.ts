import { Platform } from "react-native";

// Services
import { getSession } from "./sessionStorage";

const BACKEND_HOST_IP = "192.168.1.98";

const getSightingsByUser = async () => {
    const API_URL = Platform.OS === "web" ? "http://localhost:3000" : `http://${BACKEND_HOST_IP}:3000`;
    try {
        const session = await getSession();
        const response = await fetch(
            `${API_URL}/avistamientos/?idUsuario=${session?.userId}`,
            {
                headers: {
                    "Authorization": `Bearer ${session?.token}`
                }
            }
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener avistamientos:", error);
    }
}

export {
    getSightingsByUser
};