import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { ColoniaCard } from "../components/ColoniaCard";
import { ColoniaModal } from "../components/ColoniaModal";
import type { ColoniaFormSave } from "../components/ColoniaModal";
import type { Colonia } from "../types/models";
import { getResponsableById } from "../data/coloniaResponsables";
import { Pestanas } from "../components/Pestanas";

const ROWS_DESKTOP = 2;
const ROWS_MOBILE = 3;

const initialColonias: Colonia[] = [
  {
    id: 1,
    name: "Edificio 108",
    location: "Zona central - Ed. 108",
    description:
      "Colonia principal del área central, frente a la entrada a la biblioteca central.",
    animalCount: 12,
    esterilizadoPercent: 83,
    responsableId: "u1",
    responsableName: "M. Rodriguez",
    responsableInitials: "MR",
  },
  {
    id: 2,
    name: "Zona alberca",
    location: "Area deportiva - Alberca",
    description:
      "Colonia ubicada en los jardines alrededor de la alberca universitaria.",
    animalCount: 8,
    esterilizadoPercent: 75,
    responsableId: "u2",
    responsableName: "E. Santos",
    responsableInitials: "ES",
  },
  {
    id: 3,
    name: "UMD",
    location: "Unidad médico-didáctica",
    description:
      "Colonia en zona de estacionamiento y entrada principal de UMD.",
    animalCount: 8,
    esterilizadoPercent: 75,
    responsableId: "u3",
    responsableName: "H. Dueñas",
    responsableInitials: "HD",
    alerta: true,
  },
  {
    id: 4,
    name: "Edificio 114",
    location: "Zona noreste - Ed. 114",
    description:
      "Colonia en pasillo B y área de jardines del edificio 114 cercano a la cafeteria norte.",
    animalCount: 5,
    esterilizadoPercent: 40,
    responsableId: "u4",
    responsableName: "J. Hernandez",
    responsableInitials: "JH",
    alerta: true,
  },
  {
    id: 5,
    name: "Edificio 117",
    location: "Zona sur - Ed. 117",
    description:
      "Colonia en jardines exteriores del edificio 117, límite del campus contra plaza universidad.",
    animalCount: 9,
    esterilizadoPercent: 89,
    responsableId: "u5",
    responsableName: "J. Narvaez",
    responsableInitials: "JN",
  },
  {
    id: 6,
    name: "Edificio 59",
    location: "Zona este - Ed. 59",
    description:
      "Colonia en zona de los laboratorios de electrónica y edificio de sistemas.",
    animalCount: 10,
    esterilizadoPercent: 50,
    responsableId: "u6",
    responsableName: "B. Osorio",
    responsableInitials: "BO",
    alerta: true,
  },
  {
    id: 7,
    name: "Rectoría",
    location: "Zona norte - Rectoría",
    description:
      "Colonia en jardines y estacionamiento del edificio de rectoría universitaria.",
    animalCount: 6,
    esterilizadoPercent: 66,
    responsableId: "u1",
    responsableName: "M. Rodriguez",
    responsableInitials: "MR",
  },
  {
    id: 8,
    name: "Edificio 22",
    location: "Zona oeste - Ed. 22",
    description:
      "Colonia establecida en las áreas verdes del edificio 22 y pasillos aledaños.",
    animalCount: 4,
    esterilizadoPercent: 100,
    responsableId: "u2",
    responsableName: "E. Santos",
    responsableInitials: "ES",
  },
  {
    id: 9,
    name: "Cafetería Central",
    location: "Zona central - Cafetería",
    description:
      "Colonia en área de mesas exteriores y carga y descarga trasera de cafetería.",
    animalCount: 7,
    esterilizadoPercent: 57,
    responsableId: "u3",
    responsableName: "H. Dueñas",
    responsableInitials: "HD",
    alerta: true,
  },
  {
    id: 10,
    name: "Posgrado",
    location: "Zona sur - Posgrado",
    description:
      "Colonia en pasillos y jardines del edificio de posgrado e investigación.",
    animalCount: 3,
    esterilizadoPercent: 100,
    responsableId: "u4",
    responsableName: "J. Hernandez",
    responsableInitials: "JH",
  },
  {
    id: 11,
    name: "Estadio UAA",
    location: "Zona sur - Estadio",
    description:
      "Colonia en gradas exteriores y bodegas del estadio universitario.",
    animalCount: 11,
    esterilizadoPercent: 45,
    responsableId: "u5",
    responsableName: "J. Narvaez",
    responsableInitials: "JN",
    alerta: true,
  },
];

const Colonias = () => {
  const [colonias, setColonias] = useState<Colonia[]>(initialColonias);
  const [currentPage, setCurrentPage] = useState(1);
  const [cols, setCols] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingColonia, setEditingColonia] = useState<Colonia | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const colsRef = useRef(cols);

  useEffect(() => {
    colsRef.current = cols;
  }, [cols]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const next = w < 1024 ? 1 : w < 1536 ? 2 : 3;
      if (colsRef.current !== next) {
        setCols(next);
        setCurrentPage(1);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rows = cols === 1 ? ROWS_MOBILE : ROWS_DESKTOP;
  const itemsPerPage = cols * rows;

  const totalPages = Math.max(1, Math.ceil(colonias.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const currentColonias = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return colonias.slice(start, start + itemsPerPage);
  }, [colonias, safePage, itemsPerPage]);

  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("header-actions");
      if (el) setHeaderTarget(el);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openCreate = () => {
    setEditingColonia(null);
    setModalMode("create");
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const openEdit = (c: Colonia) => {
    setEditingColonia(c);
    setModalMode("edit");
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const handleSave = (data: ColoniaFormSave) => {
    const r = getResponsableById(data.responsableId);
    if (!r) return;

    if (data.id != null) {
      setColonias((list) =>
        list.map((c) =>
          c.id === data.id
            ? {
                ...c,
                name: data.name,
                location: data.location,
                description: data.description,
                alerta: data.alerta,
                responsableId: data.responsableId,
                responsableName: r.nombre,
                responsableInitials: r.iniciales,
              }
            : c,
        ),
      );
    } else {
      const nextId = colonias.reduce((m, c) => Math.max(m, c.id), 0) + 1;
      setColonias((list) => [
        ...list,
        {
          id: nextId,
          name: data.name,
          location: data.location,
          description: data.description,
          alerta: data.alerta,
          responsableId: data.responsableId,
          responsableName: r.nombre,
          responsableInitials: r.iniciales,
          animalCount: 0,
          esterilizadoPercent: 0,
        },
      ]);
    }
  };

  const headerDynamicContent = (
    <>
      <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-panel text-secondary">
        {colonias.length} colonias
      </span>
      <button
        type="button"
        onClick={openCreate}
        className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl hover:bg-gris-oscuro transition-colors"
      >
        <Icons.Plus className="w-5 h-5" /> Nueva Colonia
      </button>
    </>
  );

  return (
    <div className="flex flex-col h-full min-h-0 pt-2 gap-3 overflow-hidden">
      {headerTarget && createPortal(headerDynamicContent, headerTarget)}

      <ColoniaModal
        key={modalKey}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initial={editingColonia}
        onSave={handleSave}
      />

      <div
        className="flex-1 min-h-0 grid gap-2.5 auto-rows-[minmax(0,1fr)]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {currentColonias.map((colonia) => {
          const { id, ...cardProps } = colonia;
          return (
            <ColoniaCard
              key={`${id}-${safePage}`}
              {...cardProps}
              onEdit={() => openEdit(colonia)}
            />
          );
        })}
      </div>

      <Pestanas 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Colonias;
