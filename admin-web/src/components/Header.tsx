import { useState, useEffect } from "react";
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

/* ── Notification types & mock data ── */
type NotifType = "sighting" | "alert" | "info" | "report";

interface Notification {
  id: number;
  text: string;
  time: string;
  type: NotifType;
  unread: boolean;
}

const NOTIF_COLORS: Record<NotifType, { bg: string; border: string }> = {
  sighting: { bg: "#C2742F", border: "#C2742F" },   // orange
  alert:    { bg: "#C84B4B", border: "#C84B4B" },    // red
  info:     { bg: "#3a3a38", border: "#4a4a48" },     // dark gray
  report:   { bg: "#3a3a38", border: "#4a4a48" },     // dark gray (old reports turn red below)
};

const mockNotifications: Notification[] = [
  { id: 1, text: "Nuevo avistamiento en Ed. 108", time: "Hace 5 min",   type: "sighting", unread: true },
  { id: 2, text: "Reporte mensual generado",      time: "Hace 20 min",  type: "report",   unread: true },
  { id: 3, text: "Alerta de colonia UMD",         time: "Hace 1 hr",    type: "alert",    unread: true },
  { id: 4, text: "Gato 'Michi' esterilizado",     time: "Hace 2 hrs",   type: "info",     unread: false },
  { id: 5, text: "Nuevo avistamiento en Ed. 108",  time: "Hace 3 hrs",   type: "info",     unread: false },
  { id: 6, text: "Reporte mensual generado",       time: "Hace 30 días", type: "alert",    unread: false },
];

/* ── Notification Panel Component ── */
const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col border-l border-white/[0.08] shadow-2xl ${
          isExiting ? "animate-panel-out" : "animate-panel-in"
        }`}
        style={{ backgroundColor: "#1e1e1c" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-white">Notificaciones</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {notifications.map((notif, i) => {
            const colors = NOTIF_COLORS[notif.type];
            return (
              <div
                key={notif.id}
                className="rounded-xl px-5 py-3.5 cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-[1.01] animate-row-in"
                style={{
                  backgroundColor: colors.bg,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <p className="text-[15px] font-bold text-white leading-snug">
                  {notif.text}
                </p>
                <p className="text-[12px] text-white/60 font-medium mt-1">
                  {notif.time}
                </p>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-20">
              <p className="text-secondary text-sm">No hay notificaciones</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-4 border-t border-white/[0.08]">
            <button
              onClick={onMarkAllRead}
              className="w-full text-center text-acento-naranja text-sm font-bold hover:underline transition-colors"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Header Component ── */
const Header = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const isDashboard = location.pathname === "/";
  const currentTitle = routeTitles[location.pathname] || "Panel";
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <>
      <header className="sticky top-0 z-20 px-6 py-5 md:px-10 flex items-center justify-between border-b border-panel bg-gris">
        <div className="flex items-center gap-3 min-w-0">
          <h1 
            key={currentTitle}
            className="text-4xl font-extrabold text-main shrink-0 animate-title"
          >
            {currentTitle}
          </h1>

          <div 
            id="header-badge" 
            key={currentTitle + "-badge"}
            className="flex items-center shrink-0 animate-title [animation-delay:100ms]" 
          />
        </div>

        <div className="flex items-center gap-3 relative">
          {isDashboard ? (
            <button
              onClick={() => setIsNotifOpen(true)}
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
          ) : (
            <div 
              id="header-actions" 
              key={currentTitle + "-actions"}
              className="flex items-center gap-3 animate-title-reverse" 
            />
          )}
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
};

export default Header;
