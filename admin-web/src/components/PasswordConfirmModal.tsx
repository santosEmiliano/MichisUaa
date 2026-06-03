import React, { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";
import { authService } from "../services/authApi";
import { alertService } from "../services/alertService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
  title: string;
  message: string;
}

export const PasswordConfirmModal = ({ isOpen, onClose, email, onSuccess, title, message }: Props) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alertService.warning("Por favor, ingresa tu contraseña.", "Campo Requerido");
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      // Contraseña correcta
      onSuccess();
      handleClose();
    } catch (error) {
      alertService.error("La contraseña ingresada es incorrecta. No se puede continuar.", "Autenticación Fallida");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const footer = (
    <div className="flex gap-4 w-full justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador text-main font-bold bg-gris hover:bg-gris-oscuro hover:border-acento-naranja transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="form-password-confirm"
        disabled={loading}
        className="px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Verificando...
          </>
        ) : (
          "Confirmar Acción"
        )}
      </button>
    </div>
  );

  return (
    <ModalCrud isOpen={isOpen} onClose={handleClose} title={title} footer={footer}>
      <form id="form-password-confirm" onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[rgba(232,137,60,0.1)] border border-[#e8893c]/30 rounded-xl p-4 text-secondary text-sm">
          <div className="flex gap-3">
            <Icons.WarningTriangle className="w-5 h-5 text-[#e8893c] shrink-0" />
            <p>{message}</p>
          </div>
        </div>
        <div>
          <label className="block text-main font-bold mb-2">Tu Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 text-main focus:outline-none focus:border-acento-naranja hover:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] transition-all duration-200 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-secondary hover:text-main transition-colors"
            >
              {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </form>
    </ModalCrud>
  );
};
