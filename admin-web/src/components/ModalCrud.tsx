import React, { useEffect, useRef, useState } from "react";
import Icons from "./Icons";

const CLOSE_DURATION = 200; // ms — debe coincidir con la duración en CSS

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalCrud = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  // Rastrear si el mousedown empezó en el overlay (fuera del modal)
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Cuando isOpen pasa a false desde fuera, lanzar cierre animado
  useEffect(() => {
    if (!isOpen && !isClosing) {
      // No fue cerrado por handleClose, sino por cambio externo de prop
      // En ese caso simplemente no mostramos (sin animación de salida)
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCloseRef.current();
    }, CLOSE_DURATION);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-overlay backdrop-blur-sm ${
        isClosing ? "animate-overlay-out" : "animate-overlay-in"
      }`}
      onMouseDown={(e) => {
        // Solo marcar si el click empezó directamente en el overlay
        if (e.target === e.currentTarget) {
          mouseDownOnOverlay.current = true;
        }
      }}
      onClick={(e) => {
        // Solo cerrar si el mousedown Y el click (mouseup) fueron en el overlay
        if (e.target === e.currentTarget && mouseDownOnOverlay.current) {
          handleClose();
        }
        mouseDownOnOverlay.current = false;
      }}
      role="presentation"
    >
      <div
        className={`bg-gris-oscuro w-full max-w-[560px] rounded-t-[2rem] sm:rounded-b-[2rem] border-t border-sidebar-separador sm:border-x sm:border-b shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:shadow-2xl flex flex-col max-h-[90vh] ${
          isClosing ? "animate-modal-out" : "animate-modal-in"
        }`}
        onMouseDown={() => {
          // Si el click empezó dentro del modal, resetear la bandera
          mouseDownOnOverlay.current = false;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-crud-title"
      >
        {/* Pill decorativo para celular (Drag Handle) */}
        <div className="w-full flex justify-center pt-4 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-sidebar-separador rounded-full" />
        </div>

        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-sidebar-separador flex items-center justify-between gap-4">
          <h2
            id="modal-crud-title"
            className="text-xl sm:text-2xl font-bold text-main tracking-wide"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-secondary hover:text-main hover:bg-gris border border-transparent hover:border-sidebar-separador transition-all bg-gris/50 sm:bg-transparent"
            aria-label="Cerrar"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">{children}</div>

        {footer && (
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-t border-sidebar-separador flex justify-center gap-4 bg-gris-oscuro pb-8 sm:pb-6 sm:rounded-b-[2rem] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
