import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { Cat } from "../types/models";
import { GatoModal } from "../components/GatoModal";

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
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const colonias = [...new Set(cats.map((c) => c.colonia))];
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(8);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("header-actions");
      if (el) setHeaderTarget(el);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch de animales al renderizar el componente
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://localhost:3000/animal/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Error al obtener los animales");
        
        const data = await res.json();
        
        // Mapeamos los datos de la base de datos a la interfaz Cat del frontend
        const mappedCats: Cat[] = data.map((animal: any) => {
          // Calculamos la edad
          let edadStr = "Desconocida";
          if (animal.fecha_nac) {
            const anios = new Date().getFullYear() - new Date(animal.fecha_nac).getFullYear();
            edadStr = anios > 0 ? `${anios} años` : "Meses";
          }

          // Formato: "Enero 2025"
          const fechaObj = new Date(animal.createdAt);
          const mesCapitalizado = fechaObj.toLocaleString('es-ES', { month: 'long' });
          const fechaReg = `${mesCapitalizado.charAt(0).toUpperCase() + mesCapitalizado.slice(1)} ${fechaObj.getFullYear()}`;

          return {
            id: animal.idAnimal,
            nombre: animal.nombre,
            genero: "Hembra",
            edad: edadStr,
            colonia: animal.colonia?.nombre || `Colonia ${animal.Colonia_idColonia}`,
            esterilizado: animal.esterilizado,
            estado: animal.estado === "NoRegistrado" ? "No Registrado" : animal.estado,
            fechaRegistro: fechaReg,
            fotoUrl: animal.foto_url || undefined,
          };
        });

        setCats(mappedCats);
      } catch (error) {
        console.error("Error fetching cats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  const headerDynamicContent = (
    <>
      <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-panel text-secondary">
        {cats.length} {cats.length > 1 ? "registrados" : "registrado"}
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
      
      {loading ? (
        <div className="text-center py-10 text-secondary">Cargando gatos...</div>
      ) : (
        <DataTable
          data={cats}
          columns={columns}
          searchPlaceholder="Buscar por nombre o colonia..."
          rowsPerPage={rowsPerPage}
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
      )}

      <GatoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default GatosPage;
