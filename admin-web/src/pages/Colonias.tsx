import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { ColoniaCard } from "../components/ColoniaCard";
import { ColoniaModal } from "../components/ColoniaModal";
import { LoadingScreen } from "../components/LoadingScreen";
import type { ColoniaFormSave } from "../components/ColoniaModal";
import type { Colonia } from "../types/models";

import { Pestanas } from "../components/Pestanas";
import { coloniesService } from "../services/coloniesApi";

const Colonias = () => {
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [users, setUsers] = useState<{ id: string; nombre: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cols, setCols] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingColonia, setEditingColonia] = useState<Colonia | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const colsRef = useRef(cols);

  const fetchColoniasYUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Llamadas paralelas
      const [coloniasData, usersRes, animalsRes] = await Promise.all([
        coloniesService.getColonies(),
        fetch("/michisuaa/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/michisuaa/api/animal", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      let animals: { Colonia_idColonia: number; esterilizado: boolean | number }[] = [];
      if (animalsRes.ok) {
        animals = await animalsRes.json();
      }

      // Calcular estadísticas por colonia
      const colonyStats: Record<number, { total: number; esterilizados: number }> = {};
      animals.forEach((animal) => {
        const colId = animal.Colonia_idColonia;
        if (!colonyStats[colId]) colonyStats[colId] = { total: 0, esterilizados: 0 };
        colonyStats[colId].total += 1;
        // Dependiendo de si esterilizado viene como booleano o 1/0
        if (animal.esterilizado === true || animal.esterilizado === 1) {
          colonyStats[colId].esterilizados += 1;
        }
      });

      // Aplicar estadísticas
      const coloniasWithStats = coloniasData.map(col => {
        const stats = colonyStats[col.id] || { total: 0, esterilizados: 0 };
        const pct = stats.total > 0 ? Math.round((stats.esterilizados / stats.total) * 100) : 0;
        return {
          ...col,
          animalCount: stats.total,
          esterilizadoPercent: pct
        };
      });

      setColonias(coloniasWithStats);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(
          usersData.map((u: { idUsuario: number; nombre: string }) => ({
            id: String(u.idUsuario),
            nombre: u.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data", error);
      alert("Error al cargar la información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchColoniasYUsuarios();
  }, []);

  useEffect(() => {
    colsRef.current = cols;
  }, [cols]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const next = w < 768 ? 1 : w < 1280 ? 2 : 3;
      if (colsRef.current !== next) {
        setCols(next);
        setCurrentPage(1);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const ITEMS_PER_PAGE = cols === 1 ? 3 : 6;

  const totalPages = Math.max(1, Math.ceil(colonias.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const currentColonias = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return colonias.slice(start, start + ITEMS_PER_PAGE);
  }, [colonias, safePage, ITEMS_PER_PAGE]);

  const [badgeTarget, setBadgeTarget] = useState<HTMLElement | null>(null);
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setBadgeTarget(document.getElementById("header-badge"));
      setActionsTarget(document.getElementById("header-actions"));
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

  const handleSave = async (data: ColoniaFormSave) => {
    try {
      if (data.id != null) {
        // Editar
        await coloniesService.updateColony(data.id, {
          nombre: data.name,
          descripcion: data.description,
          zona: data.location,
          encargadosIds: data.responsableIds.map(Number),
        });
      } else {
        // Crear
        await coloniesService.createColony({
          nombre: data.name,
          descripcion: data.description,
          zona: data.location,
          encargadosIds: data.responsableIds.map(Number),
        });
      }
      // Recargar lista
      fetchColoniasYUsuarios();
    } catch (error) {
      const err = error as Error;
      alert(err.message || "Error al guardar la colonia");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta colonia?")) return;
    try {
      await coloniesService.deleteColony(id);
      fetchColoniasYUsuarios();
    } catch (error) {
      const err = error as Error;
      alert(err.message || "Error al eliminar la colonia");
    }
  };

  const headerBadge = (
    <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-gris-oscuro text-secondary">
      {colonias.length} colonias
    </span>
  );

  const headerAction = (
    <button
      type="button"
      onClick={openCreate}
      className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl shrink-0 transition-all duration-200 hover:bg-gris-oscuro hover:border-white/15"
    >
      <Icons.Plus className="w-5 h-5" /> Nueva Colonia
    </button>
  );

  return (
    <div className="flex flex-col h-full min-h-0 pt-2 gap-4 overflow-hidden">
      {badgeTarget && createPortal(headerBadge, badgeTarget)}
      {actionsTarget && createPortal(headerAction, actionsTarget)}

      <ColoniaModal
        key={modalKey}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initial={editingColonia}
        onSave={handleSave}
        users={users}
      />

      {loading ? (
        <LoadingScreen message="Cargando Colonias" />
      ) : colonias.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-secondary">
          No hay colonias registradas.
        </div>
      ) : (
        <div
          className="flex-1 min-h-0 grid gap-4 content-start"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {currentColonias.map((colonia, i) => {
            const { id, ...cardProps } = colonia;

            return (
              <div
                key={`${id}-${safePage}`}
                className="animate-row-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ColoniaCard
                  {...cardProps}
                  onEdit={() => openEdit(colonia)}
                  onDelete={() => handleDelete(colonia.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      <Pestanas 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Colonias;
