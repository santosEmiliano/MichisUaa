import { useState } from "react";
import { useLocation } from "react-router-dom";
import Icons from "./Icons";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/colonias": "Colonias",
  "/gatos": "Gatos",
  "/avistamientos": "Avistamientos",
  "/estadisticas": "Estadísticas",
  "/exportar": "Exportar Datos",
  "/usarios": "Usuarios",
  "/importar": "Importar",
};

//datos de prueba
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

  const currentTitle = routeTitles[location.pathname] || "Panel";

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 px-6 py-6 md:px-10 flex items-center justify-between border-b border-panel bg-main">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-extrabold text-main">{currentTitle}</h1>
        <div id="header-actions" className="flex items-center gap-4">
          {location.pathname === "/" && (
            <span
              className="text-lg px-6 py-2 rounded-full font-semibold border"
              style={{
                borderColor: "var(--accent-gold)",
                color: "var(--accent-gold)",
                backgroundColor: "rgba(216, 170, 113, 0.1)",
              }}
            >
              Colonia Central
            </span>
          )}
        </div>
      </div>

      {/*notificaciones */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="relative p-2 rounded-full hover-bg-item transition-colors"
        >
          <Icons.Bell className="w-10 h-10 text-main" />
          {unreadCount > 0 && (
            <span
              className="absolute top-2.5 right-3 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: "var(--accent-orange)",
                borderColor: "var(--bg-dark)",
              }}
            ></span>
          )}
        </button>

        {isNotifOpen && (
          <div className="absolute top-full right-0 mt-4 w-80 bg-panel border border-panel rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-panel flex justify-between items-center bg-main">
              <h3 className="font-bold text-lg text-main">Notificaciones</h3>
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

            <div className="p-3 text-center border-t border-panel bg-main hover-bg-item cursor-pointer transition-colors">
              <span className="text-orange font-semibold text-sm">
                Ver todo el historial
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;