import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icons from "./Icons";
import { useTheme } from "../contexts/ThemeContext";
import { notificationsApi } from "../services/notificationsApi";
import type { NotificacionBackend, TipoNotificacion } from "../types/models";

//Botón de refresh 

const RefreshButton = () => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    if (spinning) return;
    setSpinning(true);
    window.dispatchEvent(new CustomEvent("manual-refresh"));
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      title="Actualizar datos"
      className="p-2 rounded-full hover-bg-item transition-colors shrink-0 text-secondary hover:text-main"
    >
      <Icons.Refresh
        className={`w-5 h-5 transition-transform duration-500 ${
          spinning ? "animate-spin" : ""
        }`}
      />
    </button>
  );
};

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/colonias": "Colonias",
  "/gatos": "Gatos",
  "/avistamientos": "Avistamientos",
  "/estadisticas": "Estadísticas",
  "/usuarios": "Usuarios",
};

/* ── Notification types & helpers ── */
type NotifType = "sighting" | "alert" | "info" | "report";

interface Notification {
  id: number;
  text: string;
  time: string;
  type: NotifType;
  unread: boolean;
  url: string | null;
}

const NOTIF_COLORS: Record<NotifType, string> = {
  sighting: "bg-badge-naranja text-badge-naranja border-badge-naranja",
  alert:    "bg-badge-rojo text-badge-rojo border-badge-rojo",
  info:     "bg-badge-gris text-badge-gris border-badge-gris",
  report:   "bg-badge-gris text-badge-gris border-badge-gris",
};

const TIPO_MAP: Record<TipoNotificacion, NotifType> = {
  avistamiento_nuevo: "sighting",
  avistamiento_verificado: "sighting",
  avistamiento_rechazado: "alert",
  gato_desaparecido: "alert",
  gato_nuevo: "info",
  sistema: "info",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} hr`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("es-MX");
}

function mapNotificacion(n: NotificacionBackend): Notification {
  return {
    id: n.id,
    text: n.titulo,
    time: timeAgo(n.createdAt),
    type: TIPO_MAP[n.tipo] || "info",
    unread: !n.leida,
    url: n.url,
  };
}

/* ── Notification Panel Component ── */
const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationClick: (notif: Notification) => void;
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  // Rastrear si el mousedown empezó en el overlay (fuera del panel)
  const mouseDownOnOverlay = useRef(false);

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
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
        onMouseDown={() => {
          mouseDownOnOverlay.current = true;
        }}
        onClick={() => {
          if (mouseDownOnOverlay.current) {
            handleClose();
          }
          mouseDownOnOverlay.current = false;
        }}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col border-l border-white/[0.08] shadow-2xl bg-card ${
          isExiting ? "animate-panel-out" : "animate-panel-in"
        }`}
        onMouseDown={() => {
          mouseDownOnOverlay.current = false;
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-separador">
          <h2 className="text-xl font-bold text-main">Notificaciones</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-secondary hover:text-main hover:bg-hover transition-colors"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {notifications.map((notif, i) => {
            const colorClass = NOTIF_COLORS[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => onNotificationClick(notif)}
                className={`rounded-xl px-5 py-3.5 cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-[1.01] animate-row-in border ${colorClass}`}
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <p className="text-[15px] font-bold leading-snug">
                  {notif.text}
                </p>
                <p className="text-[12px] opacity-80 font-medium mt-1">
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

        {notifications.length > 0 && (
          <div className="px-6 py-4 border-t border-sidebar-separador">
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

const Header = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.map(mapNotificacion));
    } catch {
      // No pasa nada, dejamos que la info siga en el error
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    pollingRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch {
      // Dejamos que valga maiz en silencio
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notif: Notification) => {
      if (notif.unread) {
        try {
          await notificationsApi.markAsRead(notif.id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
          );
        } catch {
          // Tambien dejamos que valga maiz en silencio
        }
      }
      if (notif.url) {
        navigate(notif.url);
        setIsNotifOpen(false);
      }
    },
    [navigate]
  );

  const isDashboard = location.pathname === "/";
  const currentTitle = routeTitles[location.pathname] || "Panel";
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="sticky top-0 z-20 px-4 py-4 lg:px-10 lg:py-5 flex flex-wrap items-center justify-between gap-y-4 gap-x-2 border-b border-panel bg-gris">
        
        <div className={`flex items-center justify-between sm:justify-start ${isDashboard ? 'w-auto' : 'w-full'} sm:w-auto shrink-0`}>
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 lg:hidden -ml-2 rounded-lg text-secondary hover:text-main hover:bg-hover transition-colors shrink-0"
                title="Abrir menú"
              >
                <Icons.Menu className="w-6 h-6" />
              </button>
            )}
            <h1 
              key={currentTitle}
              className="text-2xl lg:text-4xl font-extrabold text-main shrink-0 animate-title"
            >
              {currentTitle}
            </h1>
          </div>

          <div 
            id="header-badge" 
            key={currentTitle + "-badge"}
            className="flex items-center shrink-0 animate-title [animation-delay:100ms] sm:ml-4" 
          />
        </div>

        <div className={`flex items-center justify-center sm:justify-end gap-3 relative ${isDashboard ? 'w-auto' : 'w-full'} sm:w-auto ml-auto shrink-0`}>
          {isDashboard && (
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-full hover-bg-item transition-colors shrink-0"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <Icons.Sun className="w-6 h-6 text-main" />
              ) : (
                <Icons.Moon className="w-6 h-6 text-main" />
              )}
            </button>
          )}

          {isDashboard ? (
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-full hover-bg-item transition-colors shrink-0"
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
            className="flex items-center justify-center gap-3 animate-title-reverse shrink-0 w-full sm:w-auto" 
          >
            {/* Botón de refresh manual: dispara evento que las páginas escuchan */}
            <RefreshButton />
          </div>
          )}
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
};

export default Header;
