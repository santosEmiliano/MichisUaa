import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Cat } from "../types/models";
import { GatoModal } from "../components/GatoModal";

const mockCats: Cat[] = [
  {
    id: 1,
    nombre: "Manchas",
    genero: "Hembra",
    edad: "2 años",
    colonia: "Ed. 108",
    esterilizado: true,
    estado: "Desaparecido",
    fechaRegistro: "Enero 2025",
  },
  {
    id: 2,
    nombre: "Michi",
    genero: "Macho",
    edad: "3 años",
    colonia: "Zona alberca",
    esterilizado: true,
    estado: "Registrado",
    fechaRegistro: "Febrero 2026",
  },
  {
    id: 3,
    nombre: "Wakanda",
    genero: "Hembra",
    edad: "1 año",
    colonia: "Ed. 114",
    esterilizado: true,
    estado: "Registrado",
    fechaRegistro: "Marzo 2023",
  },
  {
    id: 4,
    nombre: "Canela",
    genero: "Hembra",
    edad: "4 años",
    colonia: "Ed. 108",
    esterilizado: false,
    estado: "Registrado",
    fechaRegistro: "Octubre 2025",
  },
  {
    id: 5,
    nombre: "Julián",
    genero: "Hembra",
    edad: "20 años",
    colonia: "UMD",
    esterilizado: false,
    estado: "No Registrado",
    fechaRegistro: "Noviembre 2021",
  },
  {
    id: 6,
    nombre: "José",
    genero: "Hembra",
    edad: "20 años",
    colonia: "Ed. 59",
    esterilizado: false,
    estado: "Desaparecido",
    fechaRegistro: "Diciembre 2024",
  },
  {
    id: 7,
    nombre: "Santos",
    genero: "Macho",
    edad: "21 años",
    colonia: "Ed. 59",
    esterilizado: true,
    estado: "Registrado",
    fechaRegistro: "Marzo 2020",
  },
  {
    id: 8,
    nombre: "Harim",
    genero: "Macho",
    edad: "20 años",
    colonia: "Ed. 59",
    esterilizado: true,
    estado: "Desaparecido",
    fechaRegistro: "Octubre 2025",
  },
  {
    id: 9,
    nombre: "Luna",
    genero: "Hembra",
    edad: "1 año",
    colonia: "Zona alberca",
    esterilizado: true,
    estado: "Registrado",
    fechaRegistro: "Enero 2026",
  },
  {
    id: 10,
    nombre: "Tigre",
    genero: "Macho",
    edad: "5 años",
    colonia: "Ed. 108",
    esterilizado: false,
    estado: "Registrado",
    fechaRegistro: "Junio 2023",
  },
];

type EstadoCat = Cat["estado"];

const estadoBadge: Record<EstadoCat, React.CSSProperties> = {
  Registrado: {
    background: "var(--badge-verde-fondo)",
    color: "var(--badge-verde-texto)",
    border: "1px solid var(--badge-verde-texto)",
  },
  Desaparecido: {
    background: "var(--badge-rojo-fondo)",
    color: "var(--badge-rojo-texto)",
    border: "1px solid var(--badge-rojo-texto)",
  },
  "No Registrado": {
    background: "var(--badge-naranja-fondo)",
    color: "var(--badge-naranja-texto)",
    border: "1px solid var(--badge-naranja-borde)",
  },
};

const esterilizadoBadge = {
  true: {
    dot: "var(--metrica-verde)",
    bg: "var(--badge-verde-fondo)",
    text: "var(--badge-verde-texto)",
  },
  false: {
    dot: "var(--accent-orange)",
    bg: "var(--badge-naranja-fondo)",
    text: "var(--badge-naranja-texto)",
  },
};

const columns: ColumnDef<Cat>[] = [
  {
    header: "Foto",
    render: (cat) =>
      cat.fotoUrl ? (
        <img
          src={cat.fotoUrl}
          alt={cat.nombre}
          className="w-12 h-12 rounded-xl object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gris flex items-center justify-center">
          <Icons.Cats className="w-5 h-5 text-secondary" />
        </div>
      ),
  },
  {
    header: "Nombre",
    searchKey: "nombre",
    render: (cat) => (
      <div>
        <p className="font-bold text-main">{cat.nombre}</p>
        <p className="text-xs text-secondary">
          {cat.genero} — {cat.edad}
        </p>
      </div>
    ),
  },
  {
    header: "Colonia",
    searchKey: "colonia",
    render: (cat) => (
      <span className="text-secondary font-medium">{cat.colonia}</span>
    ),
  },
  {
    header: "Esterilizado",
    render: (cat) => {
      const s = esterilizadoBadge[String(cat.esterilizado) as "true" | "false"];
      return (
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: s.dot }}
          />
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: s.bg, color: s.text }}
          >
            {cat.esterilizado ? "Sí" : "No"}
          </span>
        </div>
      );
    },
  },
  {
    header: "Estado",
    render: (cat) => (
      <span
        className="text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
        style={estadoBadge[cat.estado]}
      >
        {cat.estado}
      </span>
    ),
  },
  {
    header: "Registrado",
    render: (cat) => (
      <span className="text-secondary font-medium">{cat.fechaRegistro}</span>
    ),
  },
];

const GatosPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const colonias = [...new Set(mockCats.map((c) => c.colonia))];
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
        {/* despues se sustituye con los datos que tiene el back */}
        {mockCats.length} registrados
      </span>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl hover:bg-gris-oscuro transition-colors"
      >
        <Icons.Plus className="w-5 h-5" /> Nuevo Gato
      </button>
    </>
  );

  return (
    <div className="space-y-6 pt-2">
      {headerTarget && createPortal(headerDynamicContent, headerTarget)}
      <DataTable
        data={mockCats}
        columns={columns}
        searchPlaceholder="Buscar por nombre o colonia..."
        onEdit={() => setModalOpen(true)}
        filters={[
          { label: "Todas las colonias", options: colonias },
          {
            label: "Todos los estados",
            options: ["Registrado", "Desaparecido", "No Registrado"],
          },
          { label: "Esterilizados", options: ["Sí", "No"] },
        ]}
      />

      <GatoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default GatosPage;
