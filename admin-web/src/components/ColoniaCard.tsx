import React from "react";
import Icons from "./Icons";
import type { Colonia } from "../types/models";

const GREEN = "#2a7a6a";
const RED = "#c84b4b";

export interface ColoniaCardProps extends Omit<
  Colonia,
  "id" | "responsableIds"
> {
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: "tall" | "wide";
}

const StatBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-lg border border-white/[0.08] px-2.5 py-2 min-w-0 flex flex-col justify-center ${className}`}
    style={{ backgroundColor: "#1a1a1a" }}
  >
    {children}
  </div>
);

export const ColoniaCard = ({
  name,
  location,
  description,
  animalCount,
  esterilizadoPercent,
  responsableInitials,
  responsableName,
  extraResponsablesCount,
  onEdit,
  onDelete,
  alerta,
  variant = "tall",
}: ColoniaCardProps) => {
  const topColor = alerta ? RED : GREEN;
  const animalBarPct = Math.min(100, Math.round((animalCount / 16) * 100));
  const barFill = alerta ? RED : GREEN;

  return (
    <article
      className="relative h-full min-h-0 rounded-[10px] border border-white/[0.08] p-3.5 min-w-0 overflow-hidden"
      style={{ backgroundColor: "#262626" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[10px]"
        style={{ backgroundColor: topColor }}
      />
      {alerta && (
        <div
          className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border z-10 text-main"
          style={{
            backgroundColor: RED,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        >
          Alerta
        </div>
      )}

      {variant === "tall" ? (
        <div className="flex flex-col h-full gap-2.5">
          <div className={alerta ? "pr-16" : ""}>
            <h3 className="text-base font-bold text-main tracking-tight leading-tight">
              {name}
            </h3>
            <p className="text-xs text-secondary font-medium mt-0.5">{location}</p>
          </div>

          <p className="text-xs text-secondary leading-snug line-clamp-3 min-h-0 flex-1">
            {description}
          </p>

          <div className="flex gap-2 min-h-0">
            <StatBox className="flex-1">
              <p className="text-secondary text-[10px] font-semibold mb-0.5">
                Animales
              </p>
              <p className="text-2xl font-extrabold text-main leading-none mb-1.5">
                {animalCount}
              </p>
              <div className="relative h-1 rounded-full overflow-hidden bg-black/40">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${animalBarPct}%`,
                    backgroundColor: barFill,
                  }}
                />
              </div>
            </StatBox>
            <StatBox className="flex-1">
              <p className="text-secondary text-[10px] font-semibold mb-0.5">
                Esterilizados
              </p>
              <p className="text-2xl font-extrabold text-main leading-none">
                {esterilizadoPercent}%
              </p>
            </StatBox>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-main border border-white/15"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                {responsableInitials}
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <p className="font-semibold text-main text-xs truncate">
                  {responsableName}
                </p>
                {extraResponsablesCount > 0 && (
                  <span className="text-[10px] font-bold text-acento-naranja bg-acento-naranja/10 px-1.5 py-0.5 rounded-md">
                    +{extraResponsablesCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                title="Editar colonia"
                className="p-2 rounded-lg border border-white/[0.35] text-main hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <Icons.Edit className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  title="Eliminar colonia"
                  className="p-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full gap-4 pt-1">
          <div className="flex-1 flex flex-col min-w-0 pr-2">
            <div className={alerta ? "pr-16" : ""}>
              <h3 className="text-lg font-bold text-main tracking-tight leading-tight">
                {name}
              </h3>
              <p className="text-xs text-secondary font-medium mt-0.5">{location}</p>
            </div>
            <p className="text-xs text-secondary leading-snug line-clamp-3 mt-3 flex-1">
              {description}
            </p>
          </div>
          
          <div className="w-40 flex flex-col gap-2 shrink-0 border-l border-white/5 pl-4 justify-center">
            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/[0.08]">
              <span className="text-2xl font-extrabold text-main leading-none">{animalCount}</span>
              <div className="flex-1">
                <p className="text-secondary text-[10px] font-semibold mb-1.5">Animales</p>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-black/40">
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${animalBarPct}%`, backgroundColor: barFill }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/[0.08]">
              <div className="flex-1">
                <p className="text-secondary text-[10px] font-semibold">Esterilizados</p>
              </div>
              <span className="text-xl font-extrabold text-main leading-none">{esterilizadoPercent}%</span>
            </div>
          </div>

          <div className="w-[120px] flex flex-col items-center justify-center gap-3 shrink-0 border-l border-white/5 pl-4">
            <div className="flex items-center gap-2 w-full bg-[#1a1a1a] border border-white/[0.08] p-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-main border border-white/15 bg-gris-oscuro">
                {responsableInitials}
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[10px] font-bold text-main truncate leading-tight">{responsableName}</span>
                {extraResponsablesCount > 0 && <span className="text-[9px] text-acento-naranja leading-tight">+{extraResponsablesCount}</span>}
              </div>
            </div>

            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/[0.35] text-main hover:bg-white/[0.06] transition-colors text-xs font-bold"
              >
                Editar <Icons.Edit className="w-3.5 h-3.5" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center justify-center p-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Eliminar colonia"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
