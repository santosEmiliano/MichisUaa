import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Cargando datos..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="relative w-16 h-16">
        {/* Círculo de fondo */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E8893C]/10 rounded-full"></div>
        {/* Spinner animado */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E8893C] rounded-full border-t-transparent animate-spin"></div>
        {/* Brillo central */}
        <div className="absolute inset-4 bg-[#E8893C]/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      <p className="mt-6 text-secondary text-sm font-medium tracking-widest uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
};
