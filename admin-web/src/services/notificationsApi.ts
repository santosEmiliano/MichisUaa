import type { NotificacionBackend } from "../types/models";

const API_URL = import.meta.env.VITE_API_URL || "/michisuaa/api";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const notificationsApi = {
  getAll: async (): Promise<NotificacionBackend[]> => {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener notificaciones");
    return res.json();
  },

  getUnreadCount: async (): Promise<{ noLeidas: number }> => {
    const res = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener conteo de no leídas");
    return res.json();
  },

  markAsRead: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al marcar notificación como leída");
  },

  markAllAsRead: async (): Promise<void> => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al marcar todas como leídas");
  },
};
