export const checkSession = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // El token JWT tiene 3 partes separadas por punto: header.payload.signature
    // Decodificamos el payload (la segunda parte) para leer los datos
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

    return payload.admin === true || payload.admin === 1;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return false;
  }
};

export const logoutHelper = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("isAdmin"); // Por si quedó guardado en el paso anterior
};

export const getUserName = (): string => {
  return localStorage.getItem("userName") || "Usuario";
};
