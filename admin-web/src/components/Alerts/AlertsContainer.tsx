import { useState, useEffect } from 'react';
import { alertService, type Alert } from '../../services/alertService';
import Icons from '../Icons';
import './AlertsContainer.css';

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
      case 'success': return <Icons.CheckCircle className="w-5 h-5" />;
      case 'error': return <Icons.ErrorCircle className="w-5 h-5" />;
      case 'warning': return <Icons.WarningTriangle className="w-5 h-5" />;
      case 'question': return <Icons.QuestionCircle className="w-5 h-5" />;
      default: return <Icons.Paw className="w-5 h-5" />;
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

  return (
    <>
      {Object.entries(groupedAlerts).map(([pos, posAlerts]) => (
        <div key={pos} className={`alert-container ${pos}`}>
          {posAlerts.map((alert) => (
            <div key={alert.id} className={`alert-box ${alert.type}`}>
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
                      <Icons.Paw className="w-4 h-4" />
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
          ))}
        </div>
      ))}
    </>
  );
};
