import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";
import { DataTable, type ColumnDef } from "../components/DataTable";
import type { User } from "../types/models";
import { UsuarioModal } from "../components/UsuarioModal";
import { LoadingScreen } from "../components/LoadingScreen";
import { userService } from "../services/userApi";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";


type RolUser = User["rol"];


const rolBadge: Record<RolUser, React.CSSProperties> = {
  Administrador: {
    background: "var(--badge-naranja-fondo)",
    color: "var(--badge-naranja-texto)",
    border: "1px solid var(--badge-naranja-borde)",
  },
  Simpatizante: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  },
};

const columns: ColumnDef<User>[] = [
  {
    header: "Usuario",
    searchKey: ["nombre", "email"],
    render: (user) => (
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
          style={{ background: user.colorAvatar }}
        >
          {user.iniciales}
        </div>
        <div>
          <p className="font-bold text-main">{user.nombre}</p>
          <p className="text-xs text-secondary">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Rol",
    render: (user) => (
      <span
        className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
        style={rolBadge[user.rol]}
      >
        {user.rol}
      </span>
    ),
  },
  {
    header: "Colonias asignadas",
    render: (user) =>
      user.coloniasAsignadas.length === 0 ? (
        <span className="text-secondary text-sm">Sin asignar</span>
      ) : (
        <span className="text-main text-sm font-medium">
          {user.coloniasAsignadas.join(" — ")}
        </span>
      ),
  },
  {
    header: "Creado",
    render: (user) => (
      <span className="text-secondary font-medium">{user.creadoEn}</span>
    ),
  },
];

const UsuariosPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [badgeTarget, setBadgeTarget] = useState<HTMLElement | null>(null);
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [rowsPerPage, setRowsPerPage] = useState(8);

  useEffect(() => {
    // Simular carga para mostrar el componente LoadingScreen
    const loadTimer = setTimeout(() => setLoading(false), 800);

    const timer = setTimeout(() => {
      setBadgeTarget(document.getElementById("header-badge"));
      setActionsTarget(document.getElementById("header-actions"));
    }, 0);
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(timer);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Hubo un error al cargar los usuarios: " + (error instanceof Error ? error.message : error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Hubo un error al eliminar el usuario: " + (error instanceof Error ? error.message : error));
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFilterChange = (label: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [label]: value }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const roleFilter = activeFilters["Todos los roles"];
      if (roleFilter && user.rol !== roleFilter) return false;
      return true;
    });
  }, [users, activeFilters]);

  const headerBadge = (
    <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-gris-oscuro text-secondary">
      {users.length} registrados
    </span>
  );

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

  const headerAction = (
    <button
      onClick={() => {
        setUserToEdit(null);
        setModalOpen(true);
      }}
      className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl shrink-0 transition-all duration-200 hover:bg-gris-oscuro hover:border-white/15"
    >
      <Icons.Plus className="w-5 h-5" /> Nuevo Usuario
    </button>
  );

  return (
    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 4. Si el Header ya cargó, disparamos el Portal */}
      {badgeTarget && createPortal(headerBadge, badgeTarget)}
      {actionsTarget && createPortal(headerAction, actionsTarget)}

      {loading ? (
        <LoadingScreen message="Cargando Usuarios" />
      ) : (
        <DataTable
          data={filteredUsers}
          columns={columns}
          searchPlaceholder="Buscar por nombre o email..."
          rowsPerPage={rowsPerPage}
          onEdit={(user) => {
            setUserToEdit(user);
            setModalOpen(true);
          }}
          onDelete={confirmDelete}
          onFilterChange={handleFilterChange}
          filters={[
            {
              label: "Todos los roles",
              options: ["Administrador", "Simpatizante"],
            },
          ]}
          mobileRender={(user) => (
            <div className="bg-gris-oscuro rounded-[14px] border border-sidebar-separador p-4 shadow-sm flex flex-col">
              {/* Header: Avatar, Nombre, Email */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: user.colorAvatar }}
                  >
                    {user.iniciales}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-main">{user.nombre}</span>
                    <span className="text-[12px] text-secondary mt-0.5">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Body: Información con Iconos */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-sidebar-separador text-[13px] text-secondary">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <Icons.UserCircle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Rol</span>
                  </span>
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={rolBadge[user.rol]}
                  >
                    {user.rol}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="flex items-center gap-2 shrink-0">
                    <Icons.Building className="w-4 h-4" />
                    <span className="font-medium">Colonias</span>
                  </span>
                  <span className="text-main font-medium text-right leading-tight">
                    {user.coloniasAsignadas.length === 0 ? "Sin asignar" : user.coloniasAsignadas.join(" — ")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Creado</span>
                  </span>
                  <span className="text-main font-medium">{user.creadoEn}</span>
                </div>
              </div>

              {/* Footer: Acciones */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-1">
                <button
                  onClick={() => {
                    setUserToEdit(user);
                    setModalOpen(true);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-sidebar-separador text-main text-sm font-bold hover:bg-hover transition-colors flex items-center justify-center gap-2"
                >
                  <Icons.Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => confirmDelete(user)}
                  className="w-full px-4 py-2 rounded-lg border border-badge-rojo/30 text-badge-rojo text-sm font-bold bg-badge-rojo/5 hover:bg-badge-rojo/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Icons.Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          )}
        />
      )}

      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserToEdit(null);
        }}
        onSuccess={fetchUsers}
        userToEdit={userToEdit}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title={
          userToDelete
            ? `¿Eliminar usuario "${userToDelete.nombre}"?`
            : "¿Eliminar usuario?"
        }
      />
    </div>
  );
};

export default UsuariosPage;
