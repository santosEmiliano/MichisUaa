// Este archivo ha sido deprecado a favor del nuevo alertService global.
// Por favor, usa import { alertService } from '@/services/alertService';

export const showAlert = (title: string, message: string) => {
  console.warn("showAlert está deprecado, usa alertService en su lugar.");
};