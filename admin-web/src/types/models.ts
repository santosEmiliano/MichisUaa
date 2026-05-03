export interface Cat {
  id: number;
  nombre: string;
  genero: "Macho" | "Hembra";
  edad: string;
  colonia: string;
  esterilizado: boolean;
  estado: "Registrado" | "Desaparecido" | "No Registrado";
  fechaRegistro: string;
  fotoUrl?: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  iniciales: string;
  colorAvatar: string;
  rol: "Administrador" | "Simpatizante";
  coloniasAsignadas: string[];
  creadoEn: string;
}

export interface FilterDef {
  label: string;
  options: string[];
}
