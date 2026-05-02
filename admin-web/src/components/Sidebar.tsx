import { NavLink } from "react-router-dom";
import clsx from "clsx";

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
    items: [
      { label: "Estadísticas", path: "/estadisticas" },
      { label: "Exportar datos", path: "/exportar" },
    ],
  },
  {
    group: "Sistema",
    items: [
      { label: "Usuarios", path: "/usuarios" },
      { label: "Importar Censo", path: "/importar" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-full z-40 w-72 flex flex-col transition-transform duration-300 bg-panel",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
          "md:translate-x-0": true,
        },
      )}
    >
      <div className="p-8 pb-4">
        <div className="w-12 h-14 bg-[#B7774E] rounded-b-full rounded-t-lg mb-4 flex items-center justify-center border-2 border-[#5C6E5A]">
          <span className="text-white font-bold text-xs">LOGO</span>
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
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-4 px-5 py-3.5 rounded-xl text-[17px] font-semibold transition-colors group hover-bg-item",
                      isActive
                        ? "active-bg-item text-orange"
                        : "text-secondary hover:text-white",
                    )
                  }
                  end={item.path === "/"}
                  onClick={() => {
                    if (isOpen) toggleSidebar();
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={clsx(
                          "w-2.5 h-2.5 rounded-full transition-colors",
                          isActive
                            ? "bg-orange"
                            : "bg-secondary group-hover:bg-gray-400",
                        )}
                      />

                      <span className="flex-1">{item.label}</span>

                      {item.badge && (
                        <span className="text-[13px] font-bold px-3 py-1 rounded-full bg-orange text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-panel mt-auto">
        <div className="flex items-center gap-4 p-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#D8AA71] text-black relative">
            BO
            <div className="absolute -top-3 -left-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded">
              Perfil Usuario
            </div>
          </div>
          <div>
            <p className="text-[17px] font-bold text-[#EAEAEA]">
              Santos
            </p>
            <p className="text-[14px] font-semibold text-secondary">
              Responsable de colonia
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
