import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalCrud = ({
  isOpen,
  title,
  children,
  footer,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
      <div className="bg-gris-oscuro w-full max-w-[560px] rounded-[2rem] border border-sidebar-separador shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-sidebar-separador flex items-center justify-between">
          <h2 className="text-2xl font-bold text-main tracking-wide">
            {title}
          </h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-8 py-6 border-t border-sidebar-separador flex justify-center gap-4 bg-gris-oscuro rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
