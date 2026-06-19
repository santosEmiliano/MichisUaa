export type AlertType = 'success' | 'error' | 'warning' | 'question' | 'info';

export interface AlertOptions {
  title?: string;
  message: string;
  type: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  priority?: 'normal' | 'high';
}

export interface AlertData extends AlertOptions {
  id: string;
}

type AlertListener = (alert: AlertData) => void;

class AlertService {
  private listeners: AlertListener[] = [];

  subscribe(listener: AlertListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(options: AlertOptions) {
    const alert: AlertData = {
      ...options,
      id: Math.random().toString(36).substring(2, 9),
    };
    this.listeners.forEach((listener) => listener(alert));
  }

  success(title: string, message: string) {
    this.emit({ type: 'success', title, message });
  }

  error(title: string, message: string, priority: 'normal' | 'high' = 'normal') {
    this.emit({ type: 'error', title, message, priority });
  }

  warning(title: string, message: string) {
    this.emit({ type: 'warning', title, message });
  }
  
  info(title: string, message: string) {
    this.emit({ type: 'info', title, message });
  }

  question(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ) {
    this.emit({ 
      type: 'question', 
      title, 
      message, 
      onConfirm, 
      onCancel,
      confirmText,
      cancelText
    });
  }

  questionAsync(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.question(
        title,
        message,
        () => resolve(true),
        () => resolve(false),
        confirmText,
        cancelText
      );
    });
  }
}

export const alertService = new AlertService();
