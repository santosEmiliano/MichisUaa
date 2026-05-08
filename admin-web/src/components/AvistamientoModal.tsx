import { useState, useEffect } from "react";
import type { Avistamiento, BackendAnimal } from "../types/models";
import Icons from "./Icons";
import { avistamientosApi } from "../services/avistamientosApi";
import { catsApi } from "../services/catsApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  avistamiento: Avistamiento | null;
}

export const AvistamientoModal = ({ isOpen, onClose, onSuccess, avistamiento }: Props) => {
  const [selectedGato, setSelectedGato] = useState("");
  const [cats, setCats] = useState<BackendAnimal[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para animación de entrada/salida
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [displayAvistamiento, setDisplayAvistamiento] = useState(avistamiento);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
      if (avistamiento) setDisplayAvistamiento(avistamiento);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, avistamiento]);

  // Cargar lista de gatos para el select
  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        try {
          const data = await catsApi.getCats();
          setCats(data);
        } catch (error) {
          console.error("Error al cargar gatos:", error);
        }
      };
      fetchCats();
    }
  }, [isOpen]);

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

  if (!shouldRender && !isOpen) return null;
  if (!displayAvistamiento) return null;

  const handleVerificar = async () => {
    if (!selectedGato) {
      alert("Por favor selecciona un gato para verificar el avistamiento.");
      return;
    }

    try {
      setIsProcessing(true);
      await avistamientosApi.verificarAvistamiento(displayAvistamiento.id, Number(selectedGato));
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al verificar el avistamiento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    try {
      setIsProcessing(true);
      await avistamientosApi.rechazarAvistamiento(displayAvistamiento.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al rechazar el avistamiento.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isOpen ? "visible" : isExiting ? "visible" : "invisible"
      }`}
    >
      <div 
        className={`absolute inset-0 bg-overlay backdrop-blur-sm ${
          isExiting ? "animate-overlay-out" : "animate-overlay-in"
        }`} 
        onClick={onClose}
      />
      
      <div 
        className={`bg-gris-oscuro w-full max-w-md h-full border-l border-sidebar-separador shadow-2xl flex flex-col relative ${
          isExiting ? "animate-panel-out" : "animate-panel-in"
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
                {displayAvistamiento.reportadoPor}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Fecha y hora</span>
              </div>
              <p className="text-main font-bold pl-3.5">
                {displayAvistamiento.fechaHora || "03 May 2026 - 8:14 PM"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-50" />
                <span className="text-sm font-medium">Descripción</span>
              </div>
              <p className="text-main text-sm pl-3.5 leading-relaxed">
                {displayAvistamiento.descripcion ||
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
                  {displayAvistamiento.coordenadas || "Ubicación desconocida"}
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
                  disabled={isProcessing}
                  className="w-full appearance-none bg-gris border border-sidebar-separador text-main text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="">Seleccione un gato...</option>
                  {cats.map((cat) => (
                    <option key={cat.idAnimal} value={cat.idAnimal}>
                      {cat.nombre} — {cat.colonia?.nombre || `Colonia ${cat.Colonia_idColonia}`}
                    </option>
                  ))}
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
            disabled={isProcessing}
            className="px-8 py-2.5 rounded-xl border border-acento-naranja text-acento-naranja font-bold hover:bg-[rgba(232,137,60,0.1)] transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Icons.CheckCircle className="w-5 h-5" />
            {isProcessing ? "Procesando..." : "Verificar"}
          </button>
          <button
            onClick={handleRechazar}
            disabled={isProcessing}
            className="px-8 py-2.5 rounded-xl border border-sidebar-separador text-secondary font-bold hover:text-main hover:bg-gris transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Icons.Close className="w-5 h-5" />
            {isProcessing ? "Cargando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
};

