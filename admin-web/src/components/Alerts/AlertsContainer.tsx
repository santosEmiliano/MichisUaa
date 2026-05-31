import { useState, useEffect } from 'react';
import { alertService, type Alert } from '../../services/alertService';
import Icons from '../Icons';
import './AlertsContainer.css';

export const AlertsContainer = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [closingAlerts, setClosingAlerts] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = alertService.subscribe((newAlert) => {
      setAlerts((prev) => [...prev, newAlert]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const closeAlert = (id: string) => {
    if (closingAlerts.includes(id)) return;
    setClosingAlerts((prev) => [...prev, id]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      setClosingAlerts((prev) => prev.filter((closingId) => closingId !== id));
    }, 300);
  };

  const handleConfirm = (alert: Alert) => {
    if (alert.onConfirm) alert.onConfirm();
    closeAlert(alert.id);
  };

  const handleCancel = (alert: Alert) => {
    if (alert.onCancel) alert.onCancel();
    closeAlert(alert.id);
  };

  if (alerts.length === 0) return null;

  const groupedAlerts = alerts.reduce((acc, alert) => {
    const pos = alert.position || 'center';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success': return <Icons.Paw className="w-6 h-6" />;
      case 'error': return <Icons.Paw className="w-6 h-6" />;
      case 'warning': return <Icons.Paw className="w-6 h-6" />;
      case 'question': return <Icons.Paw className="w-6 h-6" />;
      default: return <Icons.Paw className="w-6 h-6" />;
    }
  };

  const getTitleForType = (type: string, title?: string) => {
    if (title) return title;
    switch (type) {
      case 'success': return '¡Miau-gnífico!';
      case 'error': return '¡Ups! Algo salió mal';
      case 'warning': return 'Cuidado con las garras';
      case 'question': return '¿Qué opinas?';
      default: return 'Atención';
    }
  };

  const isOverlayClosing = alerts.length > 0 && alerts.length === closingAlerts.length;

  return (
    <>
      <div className={`alert-overlay ${isOverlayClosing ? 'closing' : ''}`} />

      {Object.entries(groupedAlerts).map(([pos, posAlerts]) => (
        <div key={pos} className={`alert-container ${pos}`}>
          {posAlerts.map((alert) => {
            const isClosing = closingAlerts.includes(alert.id);
            return (
              <div key={alert.id} className={`alert-box ${alert.type} ${isClosing ? 'closing' : ''}`}>
                <Icons.Paw className="alert-bg-paw alert-bg-paw-1" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-2" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-3" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-4" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-5" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-6" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-7" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-8" />
                <Icons.Cats className="alert-bg-paw alert-bg-paw-9" />
                <Icons.Cats className="alert-bg-paw alert-bg-paw-10" />
                <Icons.Cats className="alert-bg-paw alert-bg-paw-11" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-12" />
                <Icons.Paw className="alert-bg-paw alert-bg-paw-13" />
                <Icons.Cats className="alert-bg-paw alert-bg-paw-14" />
                <Icons.Cats className="alert-cat-icon text-main" />

                <div className="alert-header">
                  <div className="alert-icon">
                    {getIconForType(alert.type)}
                  </div>
                  <h3 className="alert-title">{getTitleForType(alert.type, alert.title)}</h3>
                </div>
                
                <p className="alert-message">{alert.message}</p>
                
                <div className="alert-actions">
                  {alert.type === 'question' ? (
                    <>
                      <button onClick={() => handleCancel(alert)} className="alert-btn alert-btn-close">
                        Cancelar
                      </button>
                      <button onClick={() => handleConfirm(alert)} className="alert-btn alert-btn-confirm">
                        <Icons.Paw className="w-5 h-5" />
                        Confirmar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => closeAlert(alert.id)} className="alert-btn alert-btn-close">
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};
