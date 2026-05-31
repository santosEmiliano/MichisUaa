import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { DataTable } from "../components/DataTable";
import type { ColumnDef } from "../components/DataTable";
import type { Avistamiento, FilterDef } from "../types/models";
import Icons from "../components/Icons";
import { AvistamientoModal } from "../components/AvistamientoModal";
import { avistamientosApi } from "../services/avistamientosApi";
import { LoadingScreen } from "../components/LoadingScreen";

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
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [rowsPerPage, setRowsPerPage] = useState(8);
  
  // Elementos del DOM para los portales
  const [badgeContainer, setBadgeContainer] = useState<Element | null>(null);

  useEffect(() => {
    const updateRows = () => {
      const h = window.innerHeight;
      if (h < 700) setRowsPerPage(3);
      else if (h < 850) setRowsPerPage(4);
      else if (h < 1000) setRowsPerPage(6);
      else setRowsPerPage(8);
    };
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await avistamientosApi.getAvistamientos();
      const mapped: Avistamiento[] = data.map((item) => {
        let estado: Avistamiento["estado"] = "Pendiente";
        if (item.verificado) estado = "Verificado";
        else if (item.verificadoPor !== null) estado = "Rechazado";
        else if (item.animalId === null) estado = "Sin identificar";

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
          animalId: item.animalId || undefined,
          animalColonia: item.animal?.colonia?.nombre || "N/A",
          reportadoPor: item.usuario?.nombre || "Anónimo",
          verificadoPorNombre: item.verificador?.nombre,
          ubicacion: `Lat: ${item.latitud}, Lon: ${item.longitud}`,
          hace: haceText,
          estado: estado,
          descripcion: item.descripcion || "Sin descripción proporcionada",
          coordenadas: `${item.latitud}, ${item.longitud}`,
          fechaHora: fecha.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }),
          fechaObjeto: fecha // Guardamos el objeto Date real para filtrar
        };
      });
      setAvistamientos(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDatos();
  }, [fetchDatos]);

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

  const handleQuickReject = async (id: number) => {
    try {
      setLoading(true);
      await avistamientosApi.rechazarAvistamiento(id);
      await fetchDatos();
    } catch (error) {
      console.error(error);
      alert("Error al rechazar el avistamiento");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (label: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const filteredAvistamientos = useMemo(() => {
    return avistamientos.filter(item => {
      // Filtro de Estado
      if (activeFilters["Estado"]) {
        const filterVal = activeFilters["Estado"];
        if (filterVal === "Pendientes" && item.estado !== "Pendiente") return false;
        if (filterVal === "Verificados" && item.estado !== "Verificado") return false;
        if (filterVal === "Rechazados" && item.estado !== "Rechazado") return false;
        if (filterVal === "Sin identificar" && item.estado !== "Sin identificar") return false;
      }

      // Filtro de Fechas
      if (activeFilters["Fechas"] && item.fechaObjeto) {
        const filterVal = activeFilters["Fechas"];
        const itemDate = item.fechaObjeto;
        const ahora = new Date();
        
        if (filterVal === "Hoy") {
          if (itemDate.toDateString() !== ahora.toDateString()) return false;
        } else if (filterVal === "Últimos 7 días") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(ahora.getDate() - 7);
          if (itemDate < sevenDaysAgo) return false;
        } else if (filterVal === "Este mes") {
          if (itemDate.getMonth() !== ahora.getMonth() || itemDate.getFullYear() !== ahora.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [avistamientos, activeFilters]);

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
      searchKey: ["animalName", "animalColonia"],
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
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap text-center ${getStatusBadgeClass(
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
              onClick={() => handleQuickReject(row.id)}
              disabled={loading}
              className="px-4 py-1.5 rounded-full border border-sidebar-separador text-sm text-secondary hover-bg-item transition-colors disabled:opacity-50"
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
        <span className="bg-gris text-main text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          <span className="text-acento-naranja">{avistamientos.length}</span> en total
        </span>,
        badgeContainer
      )}

      {loading ? (
        <LoadingScreen message="Cargando Avistamientos" />
      ) : (
        <DataTable
          data={filteredAvistamientos}
          columns={columns}
          searchPlaceholder="Buscar por animal, colonia o reportador..."
          filters={filters}
          onFilterChange={handleFilterChange}
          rowsPerPage={rowsPerPage}
          middleContent={
            <div className="flex justify-end gap-1 text-sm font-bold px-2 mb-2">
              <span className="text-acento-naranja">{pendientesCount}</span>
              <span className="text-main">pendientes</span>
            </div>
          }
        />
      )}

      <AvistamientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDatos}
        avistamiento={selectedAvistamiento}
      />
    </div>
  );
};

export default Avistamientos;

