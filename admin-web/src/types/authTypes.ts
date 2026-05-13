// Interfaces de respuesta para los endpoints de autenticación
export interface LoginResponse {
  mensaje: string;
  token: string;
  datos: {
    id: number;
    nombre: string;
    email: string;
    admin: boolean;
  };
}

export interface CreateUserResponse {
  mensaje: string;
  userId: number;
  token: string;
  nombre: string;
}
