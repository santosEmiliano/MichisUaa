import { useState } from "react";
import { useLocation } from "react-router-dom";
import Icons from "./Icons";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/colonias": "Colonias",
  "/gatos": "Gatos",
  "/avistamientos": "Avistamientos",
  "/estadisticas": "Estadísticas",
  "/usuarios": "Usuarios",
};

const mockNotifications = [
  {
    id: 1,
    text: "Nuevo avistamiento en Ed. 108",
    time: "Hace 5 min",
    unread: true,
  },
  {
    id: 2,
    text: "Gato 'Michi' esterilizado",
    time: "Hace 2 hrs",
    unread: true,
  },
  {
    id: 3,
    text: "Reporte mensual generado",
    time: "Hace 1 día",
    unread: false,
  },
];

const Header = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isDashboard = location.pathname === "/";
  const currentTitle = routeTitles[location.pathname] || "Panel";
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 px-6 py-5 md:px-10 flex items-center justify-between border-b border-panel bg-gris">
      <div className="flex items-center gap-3 min-w-0">
        <h1 
          key={currentTitle}
          className="text-4xl font-extrabold text-main shrink-0 animate-title"
        >
          {currentTitle}
        </h1>

        {isDashboard ? (
          <span 
            key={currentTitle + "-badge"}
            className="text-base px-5 py-1.5 rounded-full font-bold bg-badge-naranja text-badge-naranja animate-title [animation-delay:100ms]"
          >
            Colonia Central
          </span>
        ) : (
          <div 
            id="header-badge" 
            key={currentTitle + "-badge"}
            className="flex items-center shrink-0 animate-title [animation-delay:100ms]" 
          />
        )}
      </div>

      <div className="flex items-center gap-3 relative">
        {isDashboard ? (
          <>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full hover-bg-item transition-colors"
            >
              <Icons.Bell className="w-8 h-8 text-main" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    backgroundColor: "var(--accent-orange)",
                    borderColor: "var(--fondo-gris)",
                  }}
                />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-card border border-panel rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-panel flex justify-between items-center bg-gris-oscuro">
                  <h3 className="font-bold text-lg text-main">
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold px-2 py-1 bg-orange text-white rounded-full">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-panel hover-bg-item cursor-pointer transition-colors ${notif.unread ? "active-bg-item" : ""}`}
                    >
                      <p className="text-sm text-main font-medium mb-1">
                        {notif.text}
                      </p>
                      <p className="text-xs text-secondary">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-panel bg-gris-oscuro hover-bg-item cursor-pointer transition-colors">
                  <span className="text-orange font-semibold text-sm">
                    Ver todo el historial
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div 
            id="header-actions" 
            key={currentTitle + "-actions"}
            className="flex items-center gap-3 animate-title-reverse" 
          />
        )}
      </div>
    </header>
  );
};

export default Header;
