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

export interface AlertaLogicaProps {
  showAlert: (
    type: AlertType,
    title: string,
    message?: string,
    position?: AlertPosition,
    duration?: number,
  ) => void;
}
