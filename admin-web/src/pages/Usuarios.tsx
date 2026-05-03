import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { User } from "../types/models";
import { UsuarioModal } from "../components/UsuarioModal";

const mockUsers: User[] = [
  {
    id: 1,
    nombre: "E. Santos",
    email: "e.santos@edu.uaa.mx",
    iniciales: "ES",
    colorAvatar: "#7a5c2e",
    rol: "Administrador",
    coloniasAsignadas: ["Ed. 108", "UMD", "Ed. 114"],
    creadoEn: "Enero 2025",
  },
  {
    id: 2,
    nombre: "J. Hernandez",
    email: "j.hernandez@edu.uaa.mx",
    iniciales: "JH",
    colorAvatar: "#2e5c4a",
    rol: "Simpatizante",
    coloniasAsignadas: [],
    creadoEn: "Enero 2025",
  },
  {
    id: 3,
    nombre: "J. Narvaez",
    email: "j.luis@edu.uaa.mx",
    iniciales: "JN",
    colorAvatar: "#2e4a7a",
    rol: "Simpatizante",
    coloniasAsignadas: [],
    creadoEn: "Marzo 2024",
  },
  {
    id: 4,
    nombre: "H. Dueñas",
    email: "h.duenas@edu.uaa.mx",
    iniciales: "HD",
    colorAvatar: "#5c2e2e",
    rol: "Simpatizante",
    coloniasAsignadas: [],
    creadoEn: "Abril 2025",
  },
  {
    id: 5,
    nombre: "A. Rosales",
    email: "a.rosales@edu.uaa.mx",
    iniciales: "AR",
    colorAvatar: "#4a2e7a",
    rol: "Administrador",
    coloniasAsignadas: ["Zona alberca", "Ed. 108"],
    creadoEn: "Noviembre 2023",
  },
  {
    id: 6,
    nombre: "B. Osorio",
    email: "b.osorio@edu.uaa.mx",
    iniciales: "BO",
    colorAvatar: "#7a4a2e",
    rol: "Administrador",
    coloniasAsignadas: ["Ed. 114"],
    creadoEn: "Febrero 2024",
  },
];

type RolUser = User["rol"];

const rolBadge: Record<RolUser, React.CSSProperties> = {
  Administrador: {
    background: "var(--badge-naranja-fondo)",
    color: "var(--badge-naranja-texto)",
    border: "1px solid var(--badge-naranja-borde)",
  },
  Simpatizante: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  },
};

const columns: ColumnDef<User>[] = [
  {
    header: "Usuario",
    searchKey: "nombre",
    render: (user) => (
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
          style={{ background: user.colorAvatar }}
        >
          {user.iniciales}
        </div>
        <div>
          <p className="font-bold text-main">{user.nombre}</p>
          <p className="text-xs text-secondary">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Rol",
    render: (user) => (
      <span
        className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
        style={rolBadge[user.rol]}
      >
        {user.rol}
      </span>
    ),
  },
  {
    header: "Colonias asignadas",
    render: (user) =>
      user.coloniasAsignadas.length === 0 ? (
        <span className="text-secondary text-sm">Sin asignar</span>
      ) : (
        <span className="text-main text-sm font-medium">
          {user.coloniasAsignadas.join(" — ")}
        </span>
      ),
  },
  {
    header: "Creado",
    render: (user) => (
      <span className="text-secondary font-medium">{user.creadoEn}</span>
    ),
  },
];

const UsuariosPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("header-actions");
      if (el) setHeaderTarget(el);
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  const headerDynamicContent = (
    <>
      <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-panel text-secondary">
        {mockUsers.length} registrados
      </span>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl hover:bg-gris-oscuro transition-colors"
      >
        <Icons.Plus className="w-5 h-5" /> Nuevo Usuario
      </button>
    </>
  );

  return (
    <div className="space-y-6 pt-2">
      {/* 4. Si el Header ya cargó, disparamos el Portal */}
      {headerTarget && createPortal(headerDynamicContent, headerTarget)}

      <DataTable
        data={mockUsers}
        columns={columns}
        searchPlaceholder="Buscar por nombre o email..."
        onEdit={() => setModalOpen(true)}
        filters={[
          {
            label: "Todos los roles",
            options: ["Administrador", "Simpatizante"],
          },
        ]}
      />

      <UsuarioModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default UsuariosPage;
