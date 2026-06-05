import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { DataTable } from "../components/DataTable";
import type { ColumnDef } from "../components/DataTable";
import type { Avistamiento, FilterDef } from "../types/models";
import Icons from "../components/Icons";
import { AvistamientoModal } from "../components/AvistamientoModal";
import { avistamientosApi } from "../services/avistamientosApi";
import { LoadingScreen } from "../components/LoadingScreen";
import { alertService } from "../services/alertService";
import { ImagePreviewModal } from "../components/ImagePreviewModal";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [actionsContainer, setActionsContainer] = useState<Element | null>(null);

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
      alertService.error(
        "No pudimos cargar los avistamientos recientes. Intenta de nuevo más tarde.",
        "Error de Carga"
      );
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
    setActionsContainer(document.getElementById("header-actions"));
  }, []);

  // Calcular métricas
  const pendientesCount = avistamientos.filter((d) => d.estado === "Pendiente" || d.estado === "Sin identificar").length;

  const handleOpenModal = (avistamiento: Avistamiento) => {
    setSelectedAvistamiento(avistamiento);
    setIsModalOpen(true);
  };

  const handleQuickReject = async (id: number) => {
    const confirm = await alertService.questionAsync(
      "¿Estás seguro de que deseas rechazar este avistamiento?",
      "Rechazar Avistamiento"
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await avistamientosApi.rechazarAvistamiento(id);
      await fetchDatos();
      alertService.success("El avistamiento ha sido rechazado correctamente.", "Avistamiento Rechazado");
    } catch (error) {
      console.error(error);
      alertService.error(
        "Ocurrió un problema al intentar rechazar el avistamiento. Por favor, intenta de nuevo.",
        "Error al Rechazar"
      );
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

  const handleBorrarVerificacion = async (id: number) => {
    const confirm = await alertService.questionAsync(
      "¿Seguro que desea usted eliminar el siguiente avistamiento? (Es una accion permanente!)",
      "Eliminar avistamiento"
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await avistamientosApi.deleteAvistamiento(id);
      alertService.success("El avistamiento ha sido eliminado", "Avistamiento eliminado");
    } catch (error) {
      console.log(error);
      alertService.error(
        "Ocurrio un problema al momento de eliminar el avistamiento. Porfavor intentarlo mas tarde",
        "Error al eliminar"
      )
    } finally {
      setLoading(false);
    }
  }

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
            className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPreviewImage(row.fotoUrl!);
            }}
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
              <button
                onClick={() => handleBorrarVerificacion(row.id)}
                className="px-4 py-1.5 rounded-full border border-sidebar-separador text-sm text-secondary hover-bg-item transition-colors disabled:opacity-50"
              >
                <Icons.Trash2 className="w-5 h-5" />
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
            <button
                onClick={() => handleBorrarVerificacion(row.id)}
                className="px-4 py-1.5 rounded-full border border-sidebar-separador text-sm text-secondary hover-bg-item transition-colors disabled:opacity-50"
              >
                <Icons.Trash2 className="w-5 h-5" />
              </button>
          </div>
        );
      },
    },
  ];

  const headerBadge = (
    <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-gris-oscuro text-secondary">
      {avistamientos.length} {avistamientos.length === 1 ? "avistamiento" : "avistamientos"}
    </span>
  );

  return (
    <div className="space-y-6 pt-2 pb-10">
      {/* Portales para inyectar contenido en el Header global */}
      {actionsContainer && createPortal(headerBadge, actionsContainer)}

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
          mobileRender={(row) => {
            const isVerificado = row.estado === "Verificado" || row.estado === "Rechazado";
            return (
              <div className="bg-gris-oscuro rounded-[20px] border border-sidebar-separador overflow-hidden shadow-lg shadow-black/10">
                <div className="p-4 flex gap-4 border-b border-sidebar-separador/50 bg-gris/30 items-center">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gris flex items-center justify-center shrink-0 border border-sidebar-separador">
                    {row.fotoUrl ? (
                      <img 
                        src={row.fotoUrl} 
                        alt={row.animalName} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setPreviewImage(row.fotoUrl!);
                        }} 
                      />
                    ) : (
                      <Icons.Cats className="w-6 h-6 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-main text-lg truncate">{row.animalName}</h3>
                    <p className="text-xs text-secondary mt-0.5 truncate">Reportó: {row.reportadoPor}</p>
                    <div className="flex items-center gap-1.5 text-secondary text-xs font-medium mt-1.5">
                      <Icons.MapPin className="w-3.5 h-3.5 text-[#e8893c] shrink-0" />
                      <span className="truncate">{row.animalColonia}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                     <span className="text-[13px] text-secondary font-medium flex items-center gap-1.5">
                       <Icons.Clock className="w-4 h-4"/> {row.hace}
                     </span>
                     <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap text-center ${getStatusBadgeClass(row.estado)}`}>
                      {row.estado}
                     </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    {isVerificado ? (
                      <button onClick={() => handleOpenModal(row)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-sidebar-separador text-sm text-secondary hover:bg-gris transition-colors font-bold">
                        Ver detalles
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleOpenModal(row)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-badge-naranja text-sm text-badge-naranja hover:bg-[rgba(232,137,60,0.1)] transition-colors font-bold">
                          Verificar
                        </button>
                        <button onClick={() => handleQuickReject(row.id)} disabled={loading} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-sidebar-separador text-sm text-secondary hover:bg-gris transition-colors font-bold disabled:opacity-50">
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}

      <AvistamientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDatos}
        avistamiento={selectedAvistamiento}
      />

      <ImagePreviewModal
        isOpen={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default Avistamientos;

