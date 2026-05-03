import React from "react";
import Icons from "./Icons";
import type { Colonia } from "../types/models";

const GREEN = "#2a7a6a";
const RED = "#c84b4b";

export interface ColoniaCardProps extends Omit<
  Colonia,
  "id" | "responsableId"
> {
  onEdit?: () => void;
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
  onEdit,
  alerta,
}: ColoniaCardProps) => {
  const topColor = alerta ? RED : GREEN;
  const animalBarPct = Math.min(100, Math.round((animalCount / 16) * 100));
  const barFill = alerta ? RED : GREEN;

  return (
    <article
      className="relative flex flex-col h-full min-h-0 rounded-[10px] border border-white/[0.08] p-3.5 gap-2.5 min-w-0 overflow-hidden"
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
          <p className="font-semibold text-main text-xs truncate">
            {responsableName}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          title="Editar colonia"
          className="p-2 rounded-lg border border-white/[0.35] text-main hover:bg-white/[0.06] transition-colors shrink-0"
        >
          <Icons.Edit className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
