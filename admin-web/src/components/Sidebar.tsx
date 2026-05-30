import { NavLink } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import Icons from "./Icons";

type NavItem = {
  label: string;
  path: string;
  badge?: number;
};

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navGroups = [
  {
    items: [{ label: "Dashboard", path: "/" }],
  },
  {
    group: "Gestión",
    items: [
      { label: "Colonias", path: "/colonias" },
      { label: "Gatos", path: "/gatos" },
      { label: "Avistamientos", path: "/avistamientos", badge: 0 },
    ],
  },
  {
    group: "Análisis",
    items: [{ label: "Estadísticas", path: "/estadisticas" }],
  },
  {
    group: "Sistema",
    items: [{ label: "Usuarios", path: "/usuarios" }],
  },
];

import { getUserName, logoutHelper } from "../utils/auth";
import { authService } from "../services/authApi";

import { useNavigate } from "react-router-dom";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const userName = getUserName();
  const initials = userName.substring(0, 2).toUpperCase();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await authService.logout(token);
      } catch (err) {
        console.error("Error cerrando sesión en el servidor:", err);
      }
    }
    // Pequeño delay para que se vea la animación
    await new Promise((r) => setTimeout(r, 600));
    logoutHelper();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-full z-40 w-72 flex flex-col transition-transform duration-300 bg-panel animate-sidebar-entrance",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
          "md:translate-x-0": true,
        },
      )}
    >
      <div className="p-8 pb-4">
        <div className="mb-4">
          <img 
            src={`${import.meta.env.BASE_URL}MichisUAALogo.png`} 
            alt="MichisUAA Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-main tracking-wide">
          MichisUAA
        </h1>
        <p className="text-base mt-1 text-secondary">Panel de administración</p>
      </div>

      <nav className="flex-1 px-5 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className={idx === 0 ? "mb-6" : ""}>
            {group.group && (
              <h3 className="text-[15px] font-bold mb-4 px-3 text-secondary">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item: NavItem) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => {
                    if (isOpen) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-4 px-5 py-3.5 rounded-xl text-[17px] font-semibold transition-all duration-200 group hover-bg-item",
                      isActive ? "active-bg-item" : "",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-200"
                        style={{
                          backgroundColor: isActive
                            ? "var(--accent-orange)"
                            : "var(--text-secondary)",
                        }}
                      />

                      <span
                        className={clsx(
                          "flex-1 transition-all duration-200",
                          isActive
                            ? "translate-x-3 text-orange"
                            : "translate-x-0 text-secondary group-hover:text-main",
                        )}
                      >
                        {item.label}
                      </span>

                      {item.badge ? (
                        <span className="text-[13px] font-bold px-3 py-1 rounded-full bg-orange text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-panel mt-auto flex items-center justify-between">
        <div className="flex items-center gap-4 p-2 min-w-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#D8AA71] text-black relative shrink-0">
            {initials}
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-[17px] font-bold text-main truncate">{userName}</p>
            <p className="text-[14px] font-semibold text-secondary truncate">
              Administrador
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={clsx(
            "p-3 mr-1 rounded-xl transition-all shrink-0",
            loggingOut
              ? "text-red-400 bg-red-400/10 cursor-wait"
              : "text-secondary hover:text-red-400 hover:bg-red-400/10"
          )}
          title="Cerrar sesión"
        >
          {loggingOut ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <Icons.LogOut className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
