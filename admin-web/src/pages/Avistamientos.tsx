import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DataTable } from "../components/DataTable";
import type { ColumnDef } from "../components/DataTable";
import type { Avistamiento, FilterDef } from "../types/models";
import Icons from "../components/Icons";
import { AvistamientoModal } from "../components/AvistamientoModal";
import { avistamientosApi } from "../services/avistamientosApi";

const filters: FilterDef[] = [
  {
    label: "Estado",
    options: ["Pendientes", "Verificados", "Rechazados", "Sin identificar"],
  },
  {
    label: "Fechas",
    options: ["Hoy", "Últimos 7 días", "Este mes"],
  },
];

const Avistamientos = () => {
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvistamiento, setSelectedAvistamiento] =
    useState<Avistamiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Elementos del DOM para los portales
  const [badgeContainer, setBadgeContainer] = useState<Element | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const data = await avistamientosApi.getAvistamientos();
        const mapped: Avistamiento[] = data.map((item) => {
          const estado: Avistamiento["estado"] = item.verificado 
            ? "Verificado" 
            : item.verificadoPor !== null 
              ? "Rechazado" 
              : item.animalId === null 
                ? "Sin identificar" 
                : "Pendiente";
  
          const fecha = new Date(item.createdAt);
          const ahora = new Date();
          const diffMins = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
          
          const haceText = diffMins < 60 
            ? `${diffMins} min` 
            : diffMins < 1440 
              ? `${Math.floor(diffMins / 60)} hrs` 
              : `${Math.floor(diffMins / 1440)} días`;
  
          return {
            id: item.idAvistamiento,
            fotoUrl: item.foto_url || undefined,
            animalName: item.animal?.nombre || "No identificado",
            animalColonia: item.animal?.colonia?.nombre || "N/A",
            reportadoPor: item.usuario?.nombre || "Anónimo",
            ubicacion: `Lat: ${item.latitud}, Lon: ${item.longitud}`,
            hace: haceText,
            estado: estado,
            descripcion: item.descripcion || "Sin descripción proporcionada",
            coordenadas: `${item.latitud}, ${item.longitud}`,
            fechaHora: fecha.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
          };
        });
        setAvistamientos(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBadgeContainer(document.getElementById("header-badge"));
  }, []);

  // Calcular métricas
  const pendientesCount = avistamientos.filter((d) => d.estado === "Pendiente" || d.estado === "Sin identificar").length;

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
    <div className="space-y-6 pt-2 pb-10">
      {/* Portales para inyectar contenido en el Header global */}
      {badgeContainer && createPortal(
        <span className="bg-gris text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          <span className="text-acento-naranja">{avistamientos.length}</span> en total
        </span>,
        badgeContainer
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-secondary">
          Cargando avistamientos...
        </div>
      ) : (
        <DataTable
          data={avistamientos}
          columns={columns}
          searchPlaceholder="Buscar por animal, colonia o reportador..."
          filters={filters}
          rowsPerPage={8}
          middleContent={
            <div className="flex justify-end gap-1 text-sm font-bold px-2 mb-2">
              <span className="text-acento-naranja">{pendientesCount}</span>
              <span className="text-white">pendientes</span>
            </div>
          }
        />
      )}

      <AvistamientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        avistamiento={selectedAvistamiento}
      />
    </div>
  );
};

export default Avistamientos;

