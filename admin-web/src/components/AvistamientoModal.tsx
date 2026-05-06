import { useState, useEffect } from "react";
import type { Avistamiento } from "../types/models";
import Icons from "./Icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  avistamiento: Avistamiento | null;
}

export const AvistamientoModal = ({ isOpen, onClose, avistamiento }: Props) => {
  const [selectedGato, setSelectedGato] = useState("");

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Bloquear scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!avistamiento) return null;

  const handleVerificar = () => {
    // Verificar
    console.log("Verificando...", avistamiento.id, selectedGato);
    onClose();
  };

  const handleRechazar = () => {
    // Rechazar
    console.log("Rechazando...", avistamiento.id);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div 
        className="absolute inset-0 bg-overlay backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div 
        className={`bg-gris-oscuro w-full max-w-md h-full border-l border-sidebar-separador shadow-2xl flex flex-col relative transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-8 py-6 border-b border-sidebar-separador flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-2xl font-bold text-main tracking-wide">
            Detalles del avistamiento
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-main hover:bg-gris border border-transparent hover:border-sidebar-separador transition-all"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          <div className="w-full h-48 bg-gris rounded-2xl border border-panel flex items-center justify-center text-6xl">
            🐱
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Reportado por</span>
              </div>
              <p className="text-main font-bold pl-3.5">
                {avistamiento.reportadoPor}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Fecha y hora</span>
              </div>
              <p className="text-main font-bold pl-3.5">
                {avistamiento.fechaHora || "03 May 2026 - 8:14 PM"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Descripción</span>
              </div>
              <p className="text-main text-sm pl-3.5 leading-relaxed">
                {avistamiento.descripcion ||
                  "Sin descripción proporcionada por el usuario."}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Ubicación</span>
              </div>
              
              <div className="pl-3.5 space-y-2">
                <div 
                  className="w-full h-32 rounded-xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: "var(--metrica-verde)" }}
                >
                  <span className="text-3xl drop-shadow-md">📍</span>
                </div>
                <p className="text-secondary text-xs leading-relaxed">
                  {avistamiento.coordenadas || "Ubicación desconocida"}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Asociar a Gato</span>
              </div>
              <div className="pl-3.5 relative">
                <select
                  value={selectedGato}
                  onChange={(e) => setSelectedGato(e.target.value)}
                  className="w-full appearance-none bg-gris border border-sidebar-separador text-main text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja transition-colors cursor-pointer"
                >
                  <option value="">Seleccione un gato...</option>
                  <option value="canela-108">Canela - Ed. 108</option>
                  <option value="manchas-108">Manchas - Ed. 108</option>
                  <option value="michi-alberca">Michi - Zona alberca</option>
                  <option value="nuevo">-- Registrar como nuevo gato --</option>
                </select>
                <Icons.ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-secondary pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-sidebar-separador flex justify-center gap-4 bg-gris-oscuro shrink-0">
          <button
            onClick={handleVerificar}
            className="px-8 py-2.5 rounded-xl border border-acento-naranja text-acento-naranja font-bold hover:bg-[rgba(232,137,60,0.1)] transition-all duration-200 flex items-center gap-2"
          >
            <Icons.CheckCircle className="w-5 h-5" />
            Verificar
          </button>
          <button
            onClick={handleRechazar}
            className="px-8 py-2.5 rounded-xl border border-sidebar-separador text-secondary font-bold hover:text-main hover:bg-gris transition-all duration-200 flex items-center gap-2"
          >
            <Icons.Close className="w-5 h-5" />
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
};

