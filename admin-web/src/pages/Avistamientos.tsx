import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Avistamiento, FilterDef } from "../types/models";
import Icons from "../components/Icons";
import { AvistamientoModal } from "../components/AvistamientoModal";

// ── Mocks ──
const mockAvistamientos: Avistamiento[] = [
  {
    id: 1,
    animalName: "Manchas",
    animalColonia: "Ed. 108",
    reportadoPor: "Ana Rosales",
    ubicacion: "Entrada sur Ed. 108",
    hace: "5 min",
    estado: "Pendiente",
    descripcion: "El gato estaba comiendo cerca de la entrada sur, se veía en buen estado",
    coordenadas: "Entrada sur, Ed. 108 - 21.8842°N, 102.2969°W",
    fechaHora: "03 May 2026 - 8:14 PM",
  },
  {
    id: 2,
    animalName: "Michi",
    animalColonia: "Zona alberca",
    reportadoPor: "Luis Torres",
    ubicacion: "Zona alberca norte",
    hace: "23 min",
    estado: "Pendiente",
  },
  {
    id: 3,
    animalName: "No identificado",
    animalColonia: "UMD",
    reportadoPor: "Carlos Ríos",
    ubicacion: "Est. UMD",
    hace: "1 hr",
    estado: "Sin identificar",
  },
  {
    id: 4,
    animalName: "Canela",
    animalColonia: "Ed. 114",
    reportadoPor: "Sofia Mendez",
    ubicacion: "Pasillo B, Ed. 114",
    hace: "2 hrs",
    estado: "Pendiente",
  },
  {
    id: 5,
    animalName: "Wakanda",
    animalColonia: "Ed. 108",
    reportadoPor: "Jorge Ramos",
    ubicacion: "Cafetería central",
    hace: "3 hrs",
    estado: "Verificado",
  },
  {
    id: 6,
    animalName: "Tigre",
    animalColonia: "UMD",
    reportadoPor: "M. Rodriguez",
    ubicacion: "Entrada UMD",
    hace: "5 hrs",
    estado: "Rechazado",
  },
];

const filters: FilterDef[] = [
  {
    label: "Todas las colonias",
    options: ["Ed. 108", "Zona alberca", "UMD", "Ed. 114", "Colonia Central"],
  },
  {
    label: "Todos los estados",
    options: ["Pendiente", "Sin identificar", "Verificado", "Rechazado"],
  },
  {
    label: "Últimos 7 días",
    options: ["Hoy", "Últimos 7 días", "Último mes", "Todos"],
  },
];

const Avistamientos = () => {
  const [data] = useState<Avistamiento[]>(mockAvistamientos);
  const [selectedAvistamiento, setSelectedAvistamiento] = useState<Avistamiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Elementos del DOM para los portales
  const [badgeContainer, setBadgeContainer] = useState<Element | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBadgeContainer(document.getElementById("header-badge"));
  }, []);

  // Calcular métricas
  const pendientesCount = data.filter((d) => d.estado === "Pendiente").length;

  const handleOpenModal = (avistamiento: Avistamiento) => {
    setSelectedAvistamiento(avistamiento);
    setIsModalOpen(true);
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-badge-naranja text-badge-naranja border border-badge-naranja";
      case "Sin identificar":
        return "bg-badge-gris text-badge-gris border border-badge-gris";
      case "Verificado":
        return "bg-badge-verde text-badge-verde border border-[#2a7a50]";
      case "Rechazado":
        return "bg-badge-rojo text-badge-rojo border border-[#8a3939]";
      default:
        return "bg-badge-gris text-badge-gris border border-badge-gris";
    }
  };

  const columns: ColumnDef<Avistamiento>[] = [
    {
      header: "Foto",
      render: (row) =>
        row.fotoUrl ? (
          <img
            src={row.fotoUrl}
            alt={row.animalName}
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gris flex items-center justify-center">
            <Icons.Cats className="w-5 h-5 text-secondary" />
          </div>
        ),
    },
    {
      header: "Animal",
      searchKey: "animalName",
      render: (row) => (
        <div>
          <p className="font-bold text-main">{row.animalName}</p>
          <p className="text-xs text-secondary">{row.animalColonia}</p>
        </div>
      ),
    },
    {
      header: "Reportó",
      searchKey: "reportadoPor",
      render: (row) => <p className="font-medium">{row.reportadoPor}</p>,
    },
    {
      header: "Ubicación",
      searchKey: "ubicacion",
      render: (row) => <p>{row.ubicacion}</p>,
    },
    {
      header: "Hace",
      render: (row) => <p className="text-secondary">{row.hace}</p>,
    },
    {
      header: "Estado",
      searchKey: "estado",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
            row.estado
          )}`}
        >
          {row.estado}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (row) => {
        const isVerificado = row.estado === "Verificado" || row.estado === "Rechazado";
        
        if (isVerificado) {
          return (
            <div className="flex justify-start w-full">
              <button 
                onClick={() => handleOpenModal(row)}
                className="px-4 py-1.5 rounded-full border border-sidebar-separador text-sm text-secondary hover-bg-item transition-colors"
              >
                Ver detalles
              </button>
            </div>
          );
        }

        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenModal(row)}
              className="px-4 py-1.5 rounded-full border border-badge-naranja text-sm text-badge-naranja hover:bg-[rgba(232,137,60,0.1)] transition-colors"
            >
              Verificar
            </button>
            <button 
              className="px-4 py-1.5 rounded-full border border-sidebar-separador text-sm text-secondary hover-bg-item transition-colors"
            >
              Rechazar
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Portales para inyectar contenido en el Header global */}
      {badgeContainer && createPortal(
        <span className="bg-gris-oscuro text-secondary text-xs font-bold px-3 py-1 rounded-full border border-panel ml-4">
          {data.length} en total
        </span>,
        badgeContainer
      )}

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Buscar gato o usuario..."
        filters={filters}
        rowsPerPage={8}
        middleContent={
          <div className="flex justify-end gap-1 text-sm font-bold px-2 mb-2">
            <span className="text-acento-naranja">{pendientesCount}</span>
            <span className="text-white">pendientes</span>
          </div>
        }
      />

      <AvistamientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        avistamiento={selectedAvistamiento}
      />
    </div>
  );
};

export default Avistamientos;
