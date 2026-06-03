import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Cat } from "../types/models";
import { GatoModal } from "../components/GatoModal";
import { LoadingScreen } from "../components/LoadingScreen";
import { alertService } from "../services/alertService";
import { ImagePreviewModal } from "../components/ImagePreviewModal";

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

const getColumns = (onImageClick: (url: string) => void): ColumnDef<Cat>[] => [
  {
    header: "Foto",
    render: (cat) =>
      cat.fotoUrl ? (
        <img
          src={cat.fotoUrl}
          alt={cat.nombre}
          className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onImageClick(cat.fotoUrl!);
          }}
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
    render: (cat) => {
      if (cat.estado === "Desaparecido" && cat.fecha_desaparicion) {
        const [year, month, day] = cat.fecha_desaparicion.split("-");
        return (
          <div
            className="text-xs font-bold px-4 py-1.5 rounded-2xl inline-flex flex-col items-center justify-center text-center w-fit"
            style={estadoBadge[cat.estado]}
          >
            <span>{cat.estado}</span>
            <span className="text-[10px] font-medium opacity-90">{`${day}/${month}/${year}`}</span>
          </div>
        );
      }

      return (
        <span
          className="text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
          style={estadoBadge[cat.estado]}
        >
          {cat.estado}
        </span>
      );
    },
  },
  {
    header: "Registrado",
    render: (cat) => (
      <span className="text-secondary font-medium">{cat.fechaRegistro}</span>
    ),
  },
];

interface BackendAnimal {
  idAnimal: number;
  nombre: string;
  fecha_nac?: string;
  fecha_desaparicion?: string;
  createdAt: string;
  colonia?: { nombre: string };
  Colonia_idColonia: number;
  esterilizado: boolean;
  estado: string;
  foto_url?: string;
}

const GatosPage = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<Cat | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const colonias = [...new Set(cats.map((c) => c.colonia))];
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );

  const handleFilterChange = (label: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const filteredCats = useMemo(() => {
    return cats.filter((cat) => {
      if (
        activeFilters["Todas las colonias"] &&
        activeFilters["Todas las colonias"] !== ""
      ) {
        if (cat.colonia !== activeFilters["Todas las colonias"]) return false;
      }

      if (
        activeFilters["Todos los estados"] &&
        activeFilters["Todos los estados"] !== ""
      ) {
        if (cat.estado !== activeFilters["Todos los estados"]) return false;
      }

      if (
        activeFilters["Esterilizados"] &&
        activeFilters["Esterilizados"] !== ""
      ) {
        const isEsterilizadoFilter = activeFilters["Esterilizados"] === "Sí";
        if (cat.esterilizado !== isEsterilizadoFilter) return false;
      }

      if (
        activeFilters["Sexo"] &&
        activeFilters["Sexo"] !== ""
      ) {
        if (cat.genero !== activeFilters["Sexo"]) return false;
      }

      return true;
    });
  }, [cats, activeFilters]);

  const confirmDelete = async (cat: Cat) => {
    const confirm = await alertService.questionAsync(
      `¿Estás seguro que deseas eliminar al gato "${cat.nombre}"? Esta acción no se puede deshacer.`,
      "Eliminar Gato",
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/michisuaa/api/animal/${cat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el gato");

      setCats((prev) => prev.filter((c) => c.id !== cat.id));
      alertService.success(
        "El gato ha sido eliminado correctamente.",
        "Gato Eliminado",
      );
    } catch (error) {
      console.error("Error eliminando gato:", error);
      alertService.error(
        "Ocurrió un problema al intentar eliminar el gato. Por favor, intenta de nuevo más tarde.",
        "Error al Eliminar",
      );
    }
  };

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

  const [badgeTarget, setBadgeTarget] = useState<HTMLElement | null>(null);
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBadgeTarget(document.getElementById("header-badge"));
      setActionsTarget(document.getElementById("header-actions"));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch de animales
  const fetchCats = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/michisuaa/api/animal/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener los animales");

      const data = await res.json();

      // Mapeamos los datos de la base de datos a la interfaz Cat del frontend
      const mappedCats: Cat[] = data.map((animal: BackendAnimal) => {
        // Calculamos la edad
        let edadStr = "Desconocida";
        if (animal.fecha_nac) {
          const anios =
            new Date().getFullYear() - new Date(animal.fecha_nac).getFullYear();
          edadStr = anios > 0 ? `${anios} años` : "Meses";
        }

        // Formato: "Enero 2025"
        const fechaObj = new Date(animal.createdAt);
        const mesCapitalizado = fechaObj.toLocaleString("es-ES", {
          month: "long",
        });
        const fechaReg = `${mesCapitalizado.charAt(0).toUpperCase() + mesCapitalizado.slice(1)} ${fechaObj.getFullYear()}`;

        let fechaDesapStr = "";
        if (animal.fecha_desaparicion) {
          const d = new Date(animal.fecha_desaparicion);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          fechaDesapStr = `${year}-${month}-${day}`;
        }

        return {
          id: animal.idAnimal,
          nombre: animal.nombre,
          genero: animal.sexo,
          edad: edadStr,
          colonia:
            animal.colonia?.nombre || `Colonia ${animal.Colonia_idColonia}`,
          coloniaId: animal.Colonia_idColonia,
          esterilizado: animal.esterilizado,
          estado:
            animal.estado === "NoRegistrado" ? "No Registrado" : animal.estado,
          fechaRegistro: fechaReg,
          fecha_nac: animal.fecha_nac
            ? new Date(animal.fecha_nac).toISOString().split("T")[0]
            : "",
          fecha_desaparicion: fechaDesapStr,
          fotoUrl: animal.foto_url || undefined,
        };
      });

      setCats(mappedCats);
    } catch (error) {
      console.error("Error fetching cats:", error);
      alertService.error(
        "No pudimos cargar la lista de gatos. Verifica tu conexión e intenta de nuevo.",
        "Error de Carga",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCats();
  }, []);

  const headerBadge = (
    <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-gris-oscuro text-secondary">
      {cats.length} {cats.length === 1 ? "registrado" : "registrados"}
    </span>
  );

  const headerAction = (
    <button
      onClick={() => {
        setCatToEdit(null);
        setModalOpen(true);
      }}
      className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl transition-all duration-200 hover:bg-gris-oscuro hover:border-white/15 w-full sm:w-auto justify-center"
    >
      <Icons.Plus className="w-5 h-5" /> Nuevo Gato
    </button>
  );

  return (
    <div className="space-y-6 pt-2">
      {badgeTarget && createPortal(headerBadge, badgeTarget)}
      {actionsTarget && createPortal(headerAction, actionsTarget)}

      {loading ? (
        <LoadingScreen message="Cargando Gatos" />
      ) : (
        <DataTable
          data={filteredCats}
          columns={getColumns(setPreviewImage)}
          searchPlaceholder="Buscar por nombre o colonia..."
          rowsPerPage={rowsPerPage}
          onFilterChange={handleFilterChange}
          onEdit={(cat) => {
            setCatToEdit(cat);
            setModalOpen(true);
          }}
          onDelete={confirmDelete}
          filters={[
            { label: "Todas las colonias", options: colonias },
            {
              label: "Todos los estados",
              options: ["Registrado", "Desaparecido", "No Registrado"],
            },
            { label: "Sexo", options: ["Macho", "Hembra"] },
            { label: "Esterilizados", options: ["Sí", "No"] },
          ]}
          mobileRender={(cat) => (
            <div className="bg-gris-oscuro rounded-[20px] border border-sidebar-separador overflow-hidden shadow-lg shadow-black/10">
              <div className="p-4 flex gap-4 border-b border-sidebar-separador/50 bg-gris/30 items-center">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gris flex items-center justify-center shrink-0 border border-sidebar-separador">
                  {cat.fotoUrl ? (
                    <img
                      src={cat.fotoUrl}
                      alt={cat.nombre}
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPreviewImage(cat.fotoUrl!);
                      }}
                    />
                  ) : (
                    <Icons.Cats className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-main text-lg truncate">
                    {cat.nombre}
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    {cat.genero} — {cat.edad}
                  </p>
                  <div className="flex items-center gap-1.5 text-secondary text-xs font-medium mt-1.5">
                    <Icons.MapPin className="w-3.5 h-3.5 text-[#e8893c]" />
                    <span className="truncate">{cat.colonia}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {cat.estado === "Desaparecido" && cat.fecha_desaparicion ? (
                    <div
                      className="text-[10px] font-bold px-2.5 py-1 rounded-xl inline-flex flex-col items-center text-center leading-tight"
                      style={estadoBadge[cat.estado]}
                    >
                      <span>{cat.estado}</span>
                      <span className="text-[9px] font-medium opacity-90">
                        {cat.fecha_desaparicion.split("-").reverse().join("/")}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={estadoBadge[cat.estado]}
                    >
                      {cat.estado}
                    </span>
                  )}
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      background:
                        esterilizadoBadge[
                          String(cat.esterilizado) as "true" | "false"
                        ].bg,
                      color:
                        esterilizadoBadge[
                          String(cat.esterilizado) as "true" | "false"
                        ].text,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          esterilizadoBadge[
                            String(cat.esterilizado) as "true" | "false"
                          ].dot,
                      }}
                    />
                    {cat.esterilizado ? "Esterilizado" : "No Est."}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setCatToEdit(cat);
                      setModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl text-secondary hover:text-[#e8893c] hover:bg-[#e8893c]/10 border border-transparent transition-all"
                  >
                    <Icons.Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(cat)}
                    className="p-2.5 rounded-xl text-secondary hover:text-[var(--badge-rojo-texto)] hover:bg-[var(--badge-rojo-fondo)] border border-transparent transition-all"
                  >
                    <Icons.Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      <GatoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCatToEdit(null);
        }}
        onSuccess={fetchCats}
        catToEdit={catToEdit}
      />

      <ImagePreviewModal
        isOpen={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default GatosPage;
