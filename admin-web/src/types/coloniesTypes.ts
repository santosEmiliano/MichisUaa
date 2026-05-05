export interface BackendUsuarioCol {
  usuario: {
    idUsuario: number;
    nombre: string;
  };
}

export interface BackendColonia {
  idColonia: number;
  nombre: string;
  descripcion: string;
  zona: string;
  created_at: string;
  usuariosCols: BackendUsuarioCol[];
}
