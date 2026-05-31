export type AlertType = 'success' | 'error' | 'warning' | 'question';

export interface AlertOptions {
  title?: string;
  message: string;
  type: AlertType;
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

  success(message: string, title?: string) {
    this.emit({ type: 'success', message, title });
  }

  error(message: string, title?: string) {
    this.emit({ type: 'error', message, title });
  }

  warning(message: string, title?: string) {
    this.emit({ type: 'warning', message, title });
  }

  question(
    message: string,
    onConfirm: () => void,
    title?: string,
    onCancel?: () => void
  ) {
    this.emit({ type: 'question', message, title, onConfirm, onCancel });
  }
}

export const alertService = new AlertService();
