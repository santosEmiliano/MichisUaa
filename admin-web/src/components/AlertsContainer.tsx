import { useState, useEffect } from 'react';
import { alertService, type Alert } from '../services/alertService';

export const AlertsContainer = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const unsubscribe = alertService.subscribe((newAlert) => {
      setAlerts((prev) => [...prev, newAlert]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const closeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleConfirm = (alert: Alert) => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    closeAlert(alert.id);
  };

  const handleCancel = (alert: Alert) => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    closeAlert(alert.id);
  };

  if (alerts.length === 0) return null;

  // Agrupar las alertas por posición para poder apilarlas correctamente
  const groupedAlerts = alerts.reduce((acc, alert) => {
    const pos = alert.position || 'center';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  // Obtener estilos base dependiendo de la posición
  const getPositionStyles = (pos: string): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'fixed', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' };
    switch (pos) {
      case 'top-left': return { ...base, top: 20, left: 20 };
      case 'top-center': return { ...base, top: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right': return { ...base, top: 20, right: 20 };
      case 'bottom-left': return { ...base, bottom: 20, left: 20 };
      case 'bottom-center': return { ...base, bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right': return { ...base, bottom: 20, right: 20 };
      case 'center': return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', alignItems: 'center' };
      default: return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <>
      {Object.entries(groupedAlerts).map(([pos, posAlerts]) => (
        <div key={pos} style={getPositionStyles(pos)}>
          {posAlerts.map((alert) => (
            <div 
              key={alert.id} 
              style={{ 
                border: '2px solid black', 
                padding: '16px', 
                background: 'white', 
                color: 'black',
                minWidth: '250px'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>[{alert.type.toUpperCase()}]</strong> {alert.title && <span> - {alert.title}</span>}
              </div>
              <div style={{ marginBottom: '12px' }}>
                {alert.message}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {alert.type === 'question' ? (
                  <>
                    <button onClick={() => handleCancel(alert)} style={{ border: '1px solid black', padding: '4px 8px' }}>Cancelar</button>
                    <button onClick={() => handleConfirm(alert)} style={{ border: '1px solid black', padding: '4px 8px', background: 'lightgray' }}>Confirmar</button>
                  </>
                ) : (
                  <button onClick={() => closeAlert(alert.id)} style={{ border: '1px solid black', padding: '4px 8px' }}>Cerrar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
