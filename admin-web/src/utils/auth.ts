import { authService } from "../services/authApi";

export const checkSession = (): boolean => {
  const isAdmin = localStorage.getItem("isAdmin");
  
  if (isAdmin === "true" || isAdmin === "1") {
    return true;
  }
  
  return false;
};

export const logoutHelper = async (): Promise<void> => {
  try {
    await authService.logout();
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  } finally {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin"); 
    window.dispatchEvent(new Event("auth:logout"));
  }
};

export const getUserName = (): string => {
  return localStorage.getItem("userName") || "Usuario";
};
