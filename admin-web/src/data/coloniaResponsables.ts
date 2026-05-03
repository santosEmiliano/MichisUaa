export interface ColoniaResponsableOption {
  id: string;
  nombre: string;
  iniciales: string;
}

export const COLONIA_RESPONSABLE_OPTIONS: ColoniaResponsableOption[] = [
  { id: "u1", nombre: "M. Rodriguez", iniciales: "MR" },
  { id: "u2", nombre: "E. Santos", iniciales: "ES" },
  { id: "u3", nombre: "H. Dueñas", iniciales: "HD" },
  { id: "u4", nombre: "J. Hernandez", iniciales: "JH" },
  { id: "u5", nombre: "J. Narvaez", iniciales: "JN" },
  { id: "u6", nombre: "B. Osorio", iniciales: "BO" },
];

export function getResponsableById(
  id: string,
): ColoniaResponsableOption | undefined {
  return COLONIA_RESPONSABLE_OPTIONS.find((o) => o.id === id);
}
