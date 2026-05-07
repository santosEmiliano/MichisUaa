export const checkSession = (): boolean => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");
  
  // La sesión es válida si existe un token y el usuario es administrador
  return !!token && isAdmin === "true";
};

export const logoutHelper = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("isAdmin");
};

export const getUserName = (): string => {
  return localStorage.getItem("userName") || "Usuario";
};
