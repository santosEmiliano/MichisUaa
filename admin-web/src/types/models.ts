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
  responsableIds: string[];
  responsableName: string;
  responsableInitials: string;
  extraResponsablesCount: number;
  animalCount: number;
  esterilizadoPercent: number;
}

export interface FilterDef {
  label: string;
  options: string[];
}

export interface Avistamiento {
  id: number;
  fotoUrl?: string;
  animalName: string;
  animalId?: number;
  animalColonia: string;
  reportadoPor: string;
  ubicacion: string;
  hace: string;
  estado: "Pendiente" | "Verificado" | "Rechazado" | "Sin identificar";
  descripcion?: string;
  coordenadas?: string;
  fechaHora?: string;
  fechaObjeto?: Date;
}

export interface BackendAvistamiento {
  idAvistamiento: number;
  usuarioId: number;
  animalId: number | null;
  verificadoPor: number | null;
  foto_url: string | null;
  foto_id: string | null;
  descripcion: string | null;
  verificado: boolean;
  longitud: number | string;
  latitud: number | string;
  createdAt: string;
  usuario: {
    nombre: string;
    email: string;
  };
  animal: {
    nombre: string;
    colonia: {
      nombre: string;
    };
  } | null;
}

export interface BackendAnimal {
  idAnimal: number;
  nombre: string;
  Colonia_idColonia: number;
  esterilizado: boolean;
  estado: string;
  colonia: {
    nombre: string;
  };
}

/*Alertas */
export type AlertType = "success" | "error" | "warning" | "question";

export type AlertPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  position: AlertPosition;
}