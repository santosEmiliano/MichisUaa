import { useState, useEffect } from "react";
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
    searchKey: "nombre",
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
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const headerBadge = (
    <span className="text-sm font-semibold px-3 py-1 rounded-full border border-sidebar-separador bg-gris-oscuro text-secondary">
      {users.length} registrados
    </span>
  );

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
          data={users}
          columns={columns}
          searchPlaceholder="Buscar por nombre o email..."
          onEdit={(user) => {
            setUserToEdit(user);
            setModalOpen(true);
          }}
          onDelete={confirmDelete}
          filters={[
            {
              label: "Todos los roles",
              options: ["Administrador", "Simpatizante"],
            },
          ]}
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
