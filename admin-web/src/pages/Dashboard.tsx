import { useState } from "react";
import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { AvistamientoModal } from "../components/AvistamientoModal";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Avistamiento } from "../types/models";
import { mockAvistamientos } from "./Avistamientos";

const getInitials = (name: string) => {
  if (name === "No Identificado") return "?";
  return name.substring(0, 2).charAt(0).toUpperCase() + name.substring(1, 2).toLowerCase();
};

const getAvatarColorClass = (id: number) => {
  switch (id) {
    case 1:
      return "bg-badge-naranja text-badge-naranja";
    case 2:
      return "bg-[#2a7a6a]/20 text-[#4ADE80]";
    case 3:
      return "bg-badge-gris text-badge-gris";
    case 4:
      return "bg-badge-azul text-badge-azul";
    default:
      return "bg-badge-gris text-badge-gris";
  }
};

const Dashboard = () => {
  const [selectedAvistamiento, setSelectedAvistamiento] = useState<Avistamiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtramos solo los pendientes o sin identificar
  const pendientes = mockAvistamientos.filter(
    (a) => a.estado === "Pendiente" || a.estado === "Sin identificar"
  );

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
            <p className="font-bold text-white text-[15px]">{row.animalName}</p>
            <p className="text-xs text-secondary">{row.animalColonia}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Reportó",
      render: (row) => <p className="font-bold text-white text-[15px]">{row.reportadoPor}</p>,
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

  return (
    <div className="space-y-6 pt-2 pb-10">
      {/* Grid of MetricCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Gatos"
          value="47"
          trendText="en 8 colonias"
          trendType="neutral"
          borderColor="var(--accent-orange)"
        />
        <MetricCard
          title="Esterilizados"
          value="78"
          valueSuffix="%"
          trendText="37 de 48 gatos"
          trendType="neutral"
          borderColor="var(--metrica-verde)"
        />
        <MetricCard
          title="Pendientes"
          value="12"
          trendText="sin verificar"
          trendType="neutral"
          borderColor="var(--metrica-rojo)"
        />
        <MetricCard
          title="Colonias Activas"
          value="8"
          trendText="2 con alertas"
          trendType="neutral"
          borderColor="var(--metrica-azul)"
        />
      </div>

      <div className="flex items-center justify-between mt-10">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-white">
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
        avistamiento={selectedAvistamiento}
      />
    </div>
  );
};

export default Dashboard;
