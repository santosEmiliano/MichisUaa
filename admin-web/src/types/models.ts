export interface Cat {
  id: number;
  nombre: string;
  genero: "Macho" | "Hembra";
  edad: string;
  colonia: string;
  coloniaId?: number;
  esterilizado: boolean;
  estado: "Registrado" | "Desaparecido" | "No Registrado";
  fechaRegistro: string;
  fecha_nac?: string;
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

export interface Colonia {
  id: number;
  name: string;
  location: string;
  description: string;
  alerta?: boolean;
  responsableId: string;
  responsableName: string;
  responsableInitials: string;
  animalCount: number;
  esterilizadoPercent: number;
}

export interface FilterDef {
  label: string;
  options: string[];
}
