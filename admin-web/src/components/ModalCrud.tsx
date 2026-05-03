import React, { useEffect, useRef } from "react";
import Icons from "./Icons";

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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-gris-oscuro w-full max-w-[560px] rounded-[2rem] border border-sidebar-separador shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-crud-title"
      >
        <div className="px-8 py-6 border-b border-sidebar-separador flex items-center justify-between gap-4">
          <h2
            id="modal-crud-title"
            className="text-2xl font-bold text-main tracking-wide"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-main hover:bg-gris border border-transparent hover:border-sidebar-separador transition-all"
            aria-label="Cerrar"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="px-8 py-6 border-t border-sidebar-separador flex justify-center gap-4 bg-gris-oscuro rounded-b-[2rem] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
