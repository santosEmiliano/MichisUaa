import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import Icons from "../components/Icons";
import type {
  AlertType,
  AlertPosition,
  Alert,
  AlertaLogicaProps,
} from "../types/models";

const AlertContext = createContext<AlertaLogicaProps | undefined>(undefined);

const alertStyles = {
  success: { icon: Icons.CheckCircle, color: "var(--metrica-verde)" },
  error: { icon: Icons.ErrorCircle, color: "var(--metrica-rojo)" },
  warning: { icon: Icons.WarningTriangle, color: "var(--metrica-naranja)" },
  question: { icon: Icons.QuestionCircle, color: "var(--metrica-azul)" },
};

const positionClasses: Record<AlertPosition, string> = {
  "top-right": "top-6 right-6 items-end",
  "top-left": "top-6 left-6 items-start",
  "top-center": "top-6 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-left": "bottom-6 left-6 items-start",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 items-center",
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (
      type: AlertType,
      title: string,
      message?: string,
      position: AlertPosition = "bottom-right",
      duration: number = 4000,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);

      setAlerts((prev) => [...prev, { id, type, title, message, position }]);

      if (duration > 0) {
        setTimeout(() => removeAlert(id), duration);
      }
    },
    [removeAlert],
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {(Object.keys(positionClasses) as AlertPosition[]).map((pos) => {
        const alertsInPosition = alerts.filter((a) => a.position === pos);
        if (alertsInPosition.length === 0) return null;

        return (
          <div
            key={pos}
            className={`fixed z-[100] flex flex-col gap-3 pointer-events-none ${positionClasses[pos]}`}
          >
            {alertsInPosition.map((alert) => {
              const Style = alertStyles[alert.type];
              const Icon = Style.icon;

              return (
                <div
                  key={alert.id}
                  className="animate-pop-in pointer-events-auto w-80 bg-gris-oscuro border border-sidebar-separador rounded-2xl shadow-2xl overflow-hidden flex"
                >
                  {/*colores*/}
                  <div
                    className="w-1.5 shrink-0"
                    style={{ backgroundColor: Style.color }}
                  />

                  {/*contenido*/}
                  <div className="p-4 flex gap-3 w-full relative">
                    <Icon
                      className="w-6 h-6 shrink-0 mt-0.5"
                      style={{ color: Style.color }}
                    />
                    <div className="flex-1 pr-4">
                      <h4 className="text-main font-bold text-[15px] leading-snug">
                        {alert.title}
                      </h4>
                      {alert.message && (
                        <p className="text-secondary text-sm mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                      )}
                    </div>

                    {/*para eliminar alert manualmente*/}
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="absolute top-4 right-4 text-secondary hover:text-main transition-colors focus:outline-none"
                    >
                      <Icons.Close className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </AlertContext.Provider>
  );
};

// Hook personalizado para usar en cualquier parte
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert debe usarse dentro de un AlertProvider");
  return context;
};
