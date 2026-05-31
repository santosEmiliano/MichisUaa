export type AlertType = 'success' | 'error' | 'warning' | 'question';
export type AlertPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';

export interface AlertOptions {
  title?: string;
  message: string;
  type: AlertType;
  position?: AlertPosition;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface Alert extends AlertOptions {
  id: string;
}

type AlertListener = (alert: Alert) => void;

class AlertService {
  private listeners: AlertListener[] = [];

  subscribe(listener: AlertListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(options: AlertOptions) {
    const alert: Alert = {
      ...options,
      id: Math.random().toString(36).substring(2, 9),
    };
    this.listeners.forEach((listener) => listener(alert));
  }

  success(message: string, title?: string, position: AlertPosition = 'center') {
    this.emit({ type: 'success', message, title, position });
  }

  error(message: string, title?: string, position: AlertPosition = 'center') {
    this.emit({ type: 'error', message, title, position });
  }

  warning(message: string, title?: string, position: AlertPosition = 'center') {
    this.emit({ type: 'warning', message, title, position });
  }

  question(
    message: string,
    onConfirm: () => void,
    title?: string,
    onCancel?: () => void,
    position: AlertPosition = 'center'
  ) {
    this.emit({ type: 'question', message, title, onConfirm, onCancel, position });
  }
}

export const alertService = new AlertService();
