export const checkSession = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    // Verificamos si el token ha expirado (exp está en segundos)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      logoutHelper();
      return false;
    }

    const isAdmin = 
      payload.admin === true || 
      payload.admin === 1 || 
      payload.admin === "1" || 
      (payload.admin && payload.admin.type === "Buffer" && payload.admin.data && payload.admin.data[0] === 1);

    return !!isAdmin;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    alert("Hubo un error al decodificar el token: " + (error instanceof Error ? error.message : error));
    return false;
  }
};

export const logoutHelper = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("isAdmin"); // Por si quedó guardado en el paso anterior
  window.dispatchEvent(new Event("auth:logout"));
};

export const getUserName = (): string => {
  return localStorage.getItem("userName") || "Usuario";
};
