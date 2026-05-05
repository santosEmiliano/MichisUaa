import React, { useEffect, useRef } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar registro de gato?",
}) => {
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
        className="bg-card w-full max-w-md rounded-[2rem] border border-sidebar-separador shadow-2xl flex flex-col p-10 gap-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-[26px] font-bold text-main text-center tracking-wide">
          {title}
        </h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 py-4 px-6 rounded-2xl border border-metrica-naranja bg-[var(--bg-active-item)] text-main text-xl font-bold hover:bg-metrica-naranja transition-all"
          >
            Si
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl border border-sidebar-separador bg-gris-oscuro text-main text-xl font-bold hover:bg-gris transition-all"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
