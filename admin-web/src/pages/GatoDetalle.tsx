import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icons from "../components/Icons";
import { LoadingScreen } from "../components/LoadingScreen";
import { alertService } from "../services/alertService";

interface GatoDetalleData {
  idAnimal: number;
  nombre: string;
  sexo?: string;
  fecha_nac?: string;
  fecha_desaparicion?: string;
  createdAt: string;
  esterilizado: boolean;
  estado: string;
  foto_url?: string;
  colonia?: { nombre: string };
  Colonia_idColonia: number;
}

const estadoStyles: Record<string, { bg: string; text: string }> = {
  Registrado: {
    bg: "var(--badge-verde-fondo)",
    text: "var(--badge-verde-texto)",
  },
  Desaparecido: {
    bg: "var(--badge-rojo-fondo)",
    text: "var(--badge-rojo-texto)",
  },
  "No Registrado": {
    bg: "var(--badge-naranja-fondo)",
    text: "var(--badge-naranja-texto)",
  },
};

const GatoDetalle = () => {
  // useParams extrae el parámetro :id de la URL (ej. /gatos/42)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gato, setGato] = useState<GatoDetalleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchGato = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`/michisuaa/api/animal/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Error al obtener el gato");

        const data: GatoDetalleData = await res.json();
        setGato(data);
      } catch {
        alertService.error("No se pudo cargar el perfil del gato.", "Error");
        navigate("/gatos");
      } finally {
        setLoading(false);
      }
    };

    fetchGato();
  }, [id, navigate]);

  if (loading) return <LoadingScreen message="Cargando perfil del gato..." />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Icons.Cats className="w-16 h-16 text-secondary opacity-20" />
        <p className="text-xl font-bold">Gato #{id} no encontrado</p>
        <p className="text-secondary">No existe un gato con ese ID en el sistema.</p>
        <button
          onClick={() => navigate("/gatos")}
          className="flex items-center gap-2 mt-2 text-secondary hover:text-main transition-colors underline"
        >
          <Icons.ChevronLeft className="w-4 h-4" />
          Volver al listado
        </button>
      </div>
    );
  }

  if (!gato) return null;

  const estadoLabel =
    gato.estado === "NoRegistrado" ? "No Registrado" : gato.estado;
  const estilo = estadoStyles[estadoLabel] ?? {
    bg: "var(--badge-naranja-fondo)",
    text: "var(--badge-naranja-texto)",
  };

  const edad = (() => {
    if (!gato.fecha_nac) return "Desconocida";
    const anios =
      new Date().getFullYear() - new Date(gato.fecha_nac).getFullYear();
    return anios > 0 ? `${anios} años` : "Menos de 1 año";
  })();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 animate-content-entrance">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary hover:text-main transition-colors text-sm font-medium"
      >
        <Icons.ChevronLeft className="w-4 h-4" />
        Volver al listado
      </button>

      <div className="bg-card border border-panel rounded-2xl overflow-hidden shadow-lg">
        {/* Foto del gato */}
        <div className="relative h-56 bg-gris flex items-center justify-center overflow-hidden">
          {gato.foto_url ? (
            <img
              src={gato.foto_url}
              alt={gato.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icons.Cats className="w-24 h-24 text-secondary opacity-20" />
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-main">{gato.nombre}</h1>
              <p className="text-secondary text-sm mt-0.5">
                <Icons.MapPin className="inline w-3.5 h-3.5 mr-1 text-[#e8893c]" />
                {gato.colonia?.nombre ?? `Colonia #${gato.Colonia_idColonia}`}
              </p>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full shrink-0"
              style={{ background: estilo.bg, color: estilo.text }}
            >
              {estadoLabel}
            </span>
          </div>

          {/* Datos del gato */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-panel">
            <InfoField label="ID" value={`#${gato.idAnimal}`} />
            <InfoField label="Sexo" value={gato.sexo ?? "No especificado"} />
            <InfoField label="Edad estimada" value={edad} />
            <InfoField
              label="Esterilizado"
              value={gato.esterilizado ? "Sí" : "No"}
            />
            {gato.fecha_nac && (
              <InfoField
                label="Fecha de nacimiento"
                value={new Date(gato.fecha_nac).toLocaleDateString("es-MX")}
              />
            )}
            {gato.fecha_desaparicion && (
              <InfoField
                label="Fecha de desaparición"
                value={new Date(gato.fecha_desaparicion).toLocaleDateString(
                  "es-MX"
                )}
              />
            )}
            <InfoField
              label="Registrado el"
              value={new Date(gato.createdAt).toLocaleDateString("es-MX")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-secondary font-medium uppercase tracking-wide">
      {label}
    </p>
    <p className="font-semibold text-main mt-0.5">{value}</p>
  </div>
);

export default GatoDetalle;
