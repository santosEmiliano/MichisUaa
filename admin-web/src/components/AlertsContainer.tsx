import { useState, useEffect } from 'react';
import { alertService, Alert } from '../services/alertService';

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

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {alerts.map((alert) => (
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
  );
};
