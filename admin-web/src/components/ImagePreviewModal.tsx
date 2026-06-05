import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icons from "./Icons";

const CLOSE_DURATION = 200;

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePreviewModal = ({ isOpen, imageUrl, onClose }: ImagePreviewModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  // Rastrear si el mousedown empezó en el overlay (fuera del contenido)
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/80 backdrop-blur-sm cursor-pointer ${isClosing ? "animate-overlay-out" : "animate-overlay-in"
        }`}
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          mouseDownOnOverlay.current = true;
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay.current) {
          handleClose();
        }
        mouseDownOnOverlay.current = false;
      }}
      role="presentation"
    >
      {/* Botón flotante para cerrar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-105 backdrop-blur-md transition-all z-10 ${isClosing ? "animate-modal-out" : "animate-modal-in"
          }`}
        aria-label="Cerrar vista previa"
      >
        <Icons.Close className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div
        className={`relative flex items-center justify-center max-w-full max-h-full ${isClosing ? "animate-modal-out" : "animate-modal-in"
          }`}
        onMouseDown={() => {
          mouseDownOnOverlay.current = false;
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Previsualización"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
          />
        )}
      </div>
    </div>,
    document.body
  );
};

