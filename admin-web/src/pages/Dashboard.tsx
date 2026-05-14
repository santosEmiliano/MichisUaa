import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { AvistamientoModal } from "../components/AvistamientoModal";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Avistamiento } from "../types/models";
import { avistamientosApi } from "../services/avistamientosApi";
import { LoadingScreen } from "../components/LoadingScreen";

const getInitials = (name: string) => {
  if (name === "No Identificado") return "?";
  return name.substring(0, 2).charAt(0).toUpperCase() + name.substring(1, 2).toLowerCase();
};

const getAvatarColorClass = (id: number) => {
  switch (id % 4) {
    case 0:
      return "bg-badge-naranja text-badge-naranja";
    case 1:
      return "bg-[#2a7a6a]/20 text-[#4ADE80]";
    case 2:
      return "bg-badge-azul text-badge-azul";
    default:
      return "bg-badge-gris text-badge-gris";
  }
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Dashboard = () => {
  const [selectedAvistamiento, setSelectedAvistamiento] = useState<Avistamiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendientes, setPendientes] = useState<Avistamiento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Métricas
  const [totalGatos, setTotalGatos] = useState(0);
  const [esterilizados, setEsterilizados] = useState(0);
  const [esterilizadosCount, setEsterilizadosCount] = useState(0);
  const [desapariciones, setDesapariciones] = useState(0);
  const [coloniasCount, setColoniasCount] = useState(0);

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [resAvistamientos, resTotalCats, resEsterilizados, resDesapariciones, resColonias] = await Promise.all([
        fetch(`${API_URL}/avistamientos`, { headers }),
        fetch(`${API_URL}/stadistics/totalCats`, { headers }),
        fetch(`${API_URL}/stadistics/sterilizedCount`, { headers }),
        fetch(`${API_URL}/stadistics/missingCats`, { headers }),
        fetch(`${API_URL}/colonies`, { headers }),
      ]);

      if (resAvistamientos.ok) {
        const dataAvistamientos = await resAvistamientos.json();
        const mapped: Avistamiento[] = dataAvistamientos.map((item: any) => {
          let estado: Avistamiento["estado"] = "Pendiente";
          if (item.verificado) estado = "Verificado";
          else if (item.verificadoPor !== null) estado = "Rechazado";
          else if (item.animalId === null) estado = "Sin identificar";

          const fecha = new Date(item.createdAt);
          const diffMins = Math.floor((new Date().getTime() - fecha.getTime()) / 60000);
          const haceText = diffMins < 60 ? `${diffMins} min` : diffMins < 1440 ? `${Math.floor(diffMins / 60)} hrs` : `${Math.floor(diffMins / 1440)} días`;

          return {
            id: item.idAvistamiento,
            fotoUrl: item.foto_url || undefined,
            animalName: item.animal?.nombre || "No identificado",
            animalColonia: item.animal?.colonia?.nombre || "N/A",
            reportadoPor: item.usuario?.nombre || "Anónimo",
            verificadoPorNombre: item.verificador?.nombre,
            ubicacion: `Lat: ${item.latitud}, Lon: ${item.longitud}`,
            hace: haceText,
            estado: estado,
            descripcion: item.descripcion || "Sin descripción proporcionada",
            coordenadas: `${item.latitud}, ${item.longitud}`,
            fechaHora: fecha.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
          };
        });
        setPendientes(mapped.filter((a: any) => a.estado === "Pendiente" || a.estado === "Sin identificar"));
      }
      
      if (resTotalCats.ok) {
        const res = await resTotalCats.json();
        setTotalGatos(typeof res === 'number' ? res : res.total);
      }
      if (resEsterilizados.ok) {
        const data = await resEsterilizados.json();
        setEsterilizados(data.percentage);
        setEsterilizadosCount(data.count);
        setTotalGatos(data.total);
      }
      if (resDesapariciones.ok) {
        const res = await resDesapariciones.json();
        setDesapariciones(typeof res === 'number' ? res : res.total);
      }
      if (resColonias.ok) {
        const cols = await resColonias.json();
        setColoniasCount(cols.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Delay suave para la pantalla de carga
      setTimeout(() => setLoading(false), 600);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDatos();
  }, [fetchDatos]);

  const handleOpenModal = (row: Avistamiento) => {
    setSelectedAvistamiento(row);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Avistamiento>[] = [
    {
      header: "Gato",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColorClass(row.id)}`}
          >
            {getInitials(row.animalName)}
          </div>
          <div>
            <p className="font-bold text-main text-[15px]">{row.animalName}</p>
            <p className="text-xs text-secondary">{row.animalColonia}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Reportó",
      render: (row) => <p className="font-bold text-main text-[15px]">{row.reportadoPor}</p>,
    },
    {
      header: "Ubicación",
      render: (row) => (
        <p className="text-secondary text-[14px] leading-snug">
          {row.ubicacion.split(",").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx === 0 && row.ubicacion.includes(",") && <br />}
            </span>
          ))}
        </p>
      ),
    },
    {
      header: "Hace",
      render: (row) => (
        <p className="text-secondary text-[14px] max-w-[50px] leading-snug">
          {row.hace.split(" ").map((word, idx) => (
            <span key={idx}>
              {word}
              {idx === 0 && <br />}
            </span>
          ))}
        </p>
      ),
    },
    {
      header: "Estado",
      render: (row) => {
        const isPendiente = row.estado === "Pendiente";
        const badgeClass = isPendiente
          ? "bg-badge-naranja text-badge-naranja border border-badge-naranja"
          : "bg-badge-gris text-badge-gris border border-badge-gris";
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-[13px] font-bold whitespace-nowrap ${badgeClass}`}
          >
            {row.estado}
          </span>
        );
      },
    },
    {
      header: "",
      render: (row) => (
        <div className="text-right">
          <button
            onClick={() => handleOpenModal(row)}
            className="px-5 py-1.5 rounded-full border border-badge-naranja text-sm text-[#e8893c] bg-[#e8893c]/10 font-bold hover:bg-[#e8893c]/20 transition-colors whitespace-nowrap"
          >
            Ver Registro
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingScreen message="Cargando Dashboard" />;
  }

  return (
    <div className="space-y-6 pt-2 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Grid of MetricCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Gatos"
          value={totalGatos}
          trendText={`en ${coloniasCount} colonias`}
          trendType="neutral"
          borderColor="var(--accent-orange)"
        />
        <MetricCard
          title="Esterilizados"
          value={esterilizados}
          valueSuffix="%"
          trendText={`${esterilizadosCount} esterilizados de ${totalGatos}`}
          trendType="neutral"
          borderColor="var(--metrica-verde)"
        />
        <MetricCard
          title="Desaparecidos"
          value={desapariciones}
          trendText={desapariciones > 0 ? "requieren búsqueda" : ""}
          trendType={
            desapariciones === 0 ? "neutral" :
            desapariciones <= 4 ? "success" :
            desapariciones <= 8 ? "warning" : "danger"
          }
          borderColor="var(--metrica-rojo)"
        />
        <MetricCard
          title="Colonias Activas"
          value={coloniasCount}
          trendText="zonas registradas"
          trendType="neutral"
          borderColor="var(--metrica-azul)"
        />
      </div>

      <div className="flex items-center justify-between mt-10">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-main">
            Avistamientos pendientes
          </h2>
          <span className="bg-gris-oscuro text-secondary text-xs font-bold px-4 py-1.5 rounded-full border border-panel">
            {pendientes.length} por revisar
          </span>
        </div>
        <Link
          to="/avistamientos"
          className="text-acento-naranja text-sm font-bold flex items-center gap-1 hover:underline"
        >
          Ver Todos &rarr;
        </Link>
      </div>

      <div className="mt-4">
        <DataTable
          data={pendientes}
          columns={columns}
          rowsPerPage={4}
          hideControls
        />
      </div>

      <AvistamientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDatos}
        avistamiento={selectedAvistamiento}
      />
    </div>
  );
};

export default Dashboard;
