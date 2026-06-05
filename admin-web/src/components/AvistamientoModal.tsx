import { useState, useEffect, useRef } from "react";
import type { Avistamiento, BackendAnimal } from "../types/models";
import Icons from "./Icons";
import { avistamientosApi } from "../services/avistamientosApi";
import { catsApi } from "../services/catsApi";
import { alertService } from "../services/alertService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  avistamiento: Avistamiento | null;
}

export const AvistamientoModal = ({ isOpen, onClose, onSuccess, avistamiento }: Props) => {
  // Rastrear si el mousedown empezó en el overlay (fuera del panel)
  const mouseDownOnOverlay = useRef(false);
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
      if (avistamiento) {
        setDisplayAvistamiento(avistamiento);
        setSelectedGato(avistamiento.animalId ? String(avistamiento.animalId) : "");
      }
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
          alertService.error(
            "No pudimos cargar la lista de gatos disponibles. Intenta de nuevo más tarde.",
            "Error de Carga"
          );
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
      alertService.warning(
        "Por favor selecciona un gato para verificar el avistamiento.",
        "Gato no Seleccionado"
      );
      return;
    }

    try {
      setIsProcessing(true);
      if (displayAvistamiento.estado === "Rechazado") {
        await avistamientosApi.revocarRechazoAvistamiento(displayAvistamiento.id)
      } else {
        await avistamientosApi.verificarAvistamiento(displayAvistamiento.id, Number(selectedGato));
      }
      alertService.success("El avistamiento ha sido verificado correctamente.", "Avistamiento Verificado");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alertService.error(
        "Ocurrió un problema al verificar el avistamiento. Por favor, intenta de nuevo.",
        "Error al Verificar"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    const confirm = await alertService.questionAsync(
      "¿Estás seguro de que deseas rechazar este avistamiento?",
      "Rechazar Avistamiento"
    );
    if (!confirm) return;

    try {
      setIsProcessing(true);
      await avistamientosApi.rechazarAvistamiento(displayAvistamiento.id);
      alertService.success("El avistamiento ha sido rechazado.", "Avistamiento Rechazado");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alertService.error(
        "Ocurrió un problema al rechazar el avistamiento. Por favor, intenta de nuevo.",
        "Error al Rechazar"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuardarCambios = async () => {
    if (!selectedGato) {
      alertService.warning("Por favor selecciona un gato.", "Información Incompleta");
      return;
    }

    try {
      setIsProcessing(true);
      await avistamientosApi.modificarAnimalAvistamiento(displayAvistamiento.id, Number(selectedGato));
      alertService.success("Los cambios han sido guardados correctamente.", "Cambios Guardados");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alertService.error(
        "Ocurrió un problema al guardar los cambios. Por favor, intenta de nuevo.",
        "Error al Guardar"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevocarVerificacion = async () => {
    const confirm = await alertService.questionAsync(
      "¿Seguro que deseas revocar la verificación de este avistamiento?",
      "Revocar Verificación"
    );
    if (!confirm) return;

    try {
      setIsProcessing(true);
      await avistamientosApi.revocarVerificacion(displayAvistamiento.id);
      alertService.success("La verificación ha sido revocada.", "Verificación Revocada");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alertService.error(
        "Ocurrió un problema al revocar la verificación. Por favor, intenta de nuevo.",
        "Error al Revocar"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBorrarVerificacion = async () => {
    const confirm = await alertService.questionAsync(
      "¿Seguro que desea usted eliminar el siguiente avistamiento? (Es una accion permanente!)",
      "Eliminar avistamiento"
    );
    if (!confirm) return;

    try {
      setIsProcessing(true);
      await avistamientosApi.deleteAvistamiento(displayAvistamiento.id);
      alertService.success("El avistamiento ha sido eliminado", "Avistamiento eliminado");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
      alertService.error(
        "Ocurrio un problema al momento de eliminar el avistamiento. Porfavor intentarlo mas tarde",
        "Error al eliminar"
      )
    } finally {
      setIsProcessing(false);
    }
  }

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
        onMouseDown={() => {
          mouseDownOnOverlay.current = true;
        }}
        onClick={() => {
          if (mouseDownOnOverlay.current) {
            onClose();
          }
          mouseDownOnOverlay.current = false;
        }}
      />
      
      <div 
        className={`bg-gris-oscuro w-full max-w-md h-full sm:border-l border-sidebar-separador shadow-2xl flex flex-col relative ${
          isExiting ? "animate-panel-out" : "animate-panel-in"
        }`}
        onMouseDown={() => {
          mouseDownOnOverlay.current = false;
        }}
      >
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-sidebar-separador flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-main tracking-wide">
            Detalles del avistamiento
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-main hover:bg-gris border border-transparent hover:border-sidebar-separador transition-all"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 min-h-0 space-y-6 custom-scrollbar">
          <div className="w-full h-48 bg-gris rounded-2xl border border-panel overflow-hidden shadow-inner">
            {displayAvistamiento.fotoUrl ? (
              <img
                src={displayAvistamiento.fotoUrl}
                alt="Foto del avistamiento"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🐱
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="text-sm font-medium">Reportado por</span>
              </div>
              <p className="text-main font-bold">
                {displayAvistamiento.reportadoPor}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="text-sm font-medium">Fecha y hora</span>
              </div>
              <p className="text-main font-bold">
                {displayAvistamiento.fechaHora || "03 May 2026 - 8:14 PM"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <span className="text-sm font-medium">Descripción</span>
              </div>
              <p className="text-main text-[15px] leading-relaxed">
                {displayAvistamiento.descripcion ||
                  "Sin descripción proporcionada por el usuario."}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-secondary mb-2">
                <span className="text-sm font-medium">Ubicación aproximada</span>
              </div>
              
              <div className="space-y-2">
                {(() => {
                  let lat = null, lon = null;
                  if (displayAvistamiento.coordenadas) {
                    const parts = displayAvistamiento.coordenadas.split(',');
                    if (parts.length === 2) {
                      lat = parseFloat(parts[0].trim());
                      lon = parseFloat(parts[1].trim());
                    }
                  }

                  return (
                    <>
                      {lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon) ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-56 rounded-xl overflow-hidden shadow-inner relative bg-gris block group cursor-pointer"
                        >
                          {/* Google Maps embed es mucho más limpio y no tapa el pin. pointer-events-none evita moverlo. */}
                          <iframe 
                            src={`https://maps.google.com/maps?q=${lat},${lon}&z=17&output=embed`}
                            className="w-full h-full border-0 pointer-events-none group-hover:opacity-80 transition-opacity"
                            title="Ubicación del avistamiento"
                            scrolling="no"
                            loading="lazy"
                          />
                          {/* Overlay indicador de clic */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-gris-oscuro/95 text-main px-4 py-2.5 rounded-xl text-[14px] font-bold shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              <Icons.MapPin className="w-4 h-4 text-[#e8893c]" />
                              Abrir en Google Maps
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div 
                          className="w-full h-32 rounded-xl flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: "var(--metrica-verde)" }}
                        >
                          <span className="text-3xl drop-shadow-md">📍</span>
                        </div>
                      )}
                      <p className="text-secondary text-[13px] leading-relaxed">
                        {displayAvistamiento.coordenadas || "Ubicación desconocida"}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {displayAvistamiento.verificadoPorNombre && (
              <div>
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <span className="text-sm font-medium">
                    {displayAvistamiento.estado === "Verificado" ? "Verificado por" : "Rechazado por"}
                  </span>
                </div>
                <p className="text-main text-[15px] leading-relaxed">
                  {displayAvistamiento.verificadoPorNombre}
                </p>
              </div>
            )}

            <div className="pt-2">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <span className="text-sm font-medium">
                  {displayAvistamiento.estado === "Verificado" ? "Gato asociado" : "Gato asociado"}
                </span>
              </div>
              {displayAvistamiento.estado !== "Rechazado" ? (
                <div className="relative">
                  <select
                    value={selectedGato}
                    onChange={(e) => setSelectedGato(e.target.value)}
                    disabled={isProcessing}
                    className="w-full appearance-none bg-gris border border-sidebar-separador text-main text-[15px] rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:border-[#e8893c] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Seleccione un gato...</option>
                    {cats.map((cat) => (
                      <option key={cat.idAnimal} value={cat.idAnimal}>
                        {cat.nombre} — {cat.colonia?.nombre || `Colonia ${cat.Colonia_idColonia}`}
                      </option>
                    ))}
                    <option value="nuevo">-- Registrar como nuevo gato --</option>
                  </select>
                  <Icons.ChevronDown className="absolute right-4 top-4 w-4 h-4 text-secondary pointer-events-none" />
                </div>
              ) : (
                <p className="text-main text-[15px] leading-relaxed">
                  {displayAvistamiento.animalName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-t border-sidebar-separador flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 bg-gris-oscuro shrink-0">
          {displayAvistamiento.estado === "Verificado" ? (
            <>
              <button
                onClick={handleRevocarVerificacion}
                disabled={isProcessing}
                className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 rounded-xl border border-sidebar-separador text-main font-bold hover:bg-[rgba(200,75,75,0.1)] hover:border-metrica-rojo hover:text-badge-rojo transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Icons.Close className="w-5 h-5" />
                {isProcessing ? "Revocando..." : "Revocar"}
              </button>
              <button
                onClick={handleGuardarCambios}
                disabled={isProcessing}
                className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 rounded-xl border border-[#e8893c] bg-[#e8893c] text-white font-bold hover:brightness-110 shadow-lg shadow-[#e8893c]/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Icons.CheckCircle className="w-5 h-5" />
                {isProcessing ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <>
              {displayAvistamiento.estado !== "Rechazado" && (
                <button
                  onClick={handleRechazar}
                  disabled={isProcessing}
                  className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 rounded-xl border border-sidebar-separador text-main font-bold hover:text-main hover:bg-gris transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <Icons.Close className="w-5 h-5" />
                  {isProcessing ? "Cargando..." : "Rechazar"}
                </button>
              )}
              <button
                onClick={handleVerificar}
                disabled={isProcessing}
                className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 rounded-xl border border-[#e8893c] bg-[#e8893c] text-white font-bold hover:brightness-110 shadow-lg shadow-[#e8893c]/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Icons.CheckCircle className="w-5 h-5" />
                {isProcessing
                  ? "Procesando..."
                  : displayAvistamiento.estado === "Rechazado"
                    ? "Quitar Rechazo"
                    : "Verificar"}
              </button>
            </>
          )}
          <button
            onClick={handleBorrarVerificacion}
            disabled={isProcessing}
            className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 rounded-xl border border-sidebar-separador text-main font-bold hover:text-main hover:bg-gris transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Icons.Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

