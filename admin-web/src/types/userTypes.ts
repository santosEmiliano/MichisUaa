export interface BackendUsuarioCol {
  colonia: {
    idColonia: number;
    nombre: string;
  };
}

export interface BackendUser {
  idUsuario: number;
  nombre: string;
  email: string;
  admin: boolean;
  createdAt: string;
  usuariosCols: BackendUsuarioCol[];
}

export interface UpdateUserResponse {
  mensaje: string;
  modificado: boolean;
}

export interface DeleteUserResponse {
  mensaje: string;
}