import Icons from "./Icons";
import type { Colonia } from "../types/models";

const GREEN = "#2a7a6a";
const RED = "#c84b4b";

export interface ColoniaCardProps extends Omit<Colonia, "id" | "responsableIds"> {
  onEdit?: () => void;
  onDelete?: () => void;
}

/* ── Mini ring chart ── */
const MiniRing = ({ percent, size = 52, stroke = 4.5 }: { percent: number; size?: number; stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 60 ? GREEN : RED;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
};

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
}: ColoniaCardProps) => {
  const accentColor = alerta ? RED : GREEN;

  return (
    <article
      className="group relative rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col transition-all duration-300 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/20 bg-gris-oscuro"
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: accentColor }} />

      {alerta && (
        <div
          className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full z-10 text-white"
          style={{ backgroundColor: RED }}
        >
          ⚠ Alerta
        </div>
      )}

      {/* Content */}
      <div className="px-5 pt-5 pb-4 flex-1 flex flex-col">
        {/* Title + Location */}
        <div>
          <h3 className="text-lg font-bold text-main leading-tight">{name}</h3>
          <p className="text-[13px] text-secondary mt-1 flex items-center gap-1.5">
            <Icons.Colonies className="w-3.5 h-3.5 shrink-0 opacity-60" />
            {location}
          </p>
        </div>

        {/* Description */}
        <p className="text-[13px] text-secondary leading-relaxed mt-3 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 bg-card rounded-xl px-4 py-3 border border-sidebar-separador">
          <div className="relative shrink-0">
            <MiniRing percent={esterilizadoPercent} />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-main">
              {esterilizadoPercent}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-main leading-tight">{animalCount} {animalCount === 1 ? "gato" : "gatos"}</p>
            <p className="text-xs text-secondary mt-0.5">{Math.round(animalCount * esterilizadoPercent / 100)} esterilizados</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-sidebar-separador flex items-center justify-between bg-gris">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-main border border-sidebar-separador bg-gris-oscuro"
          >
            {responsableInitials}
          </div>
          <span className="text-sm text-secondary font-medium truncate">{responsableName}</span>
          {extraResponsablesCount > 0 && (
            <span className="text-[10px] font-bold text-acento-naranja bg-acento-naranja/10 px-1.5 py-0.5 rounded-md shrink-0">
              +{extraResponsablesCount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            title="Editar colonia"
            className="p-2 rounded-lg border border-sidebar-separador text-secondary hover:text-main hover:bg-hover hover:border-acento-naranja transition-all"
          >
            <Icons.Edit className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar colonia"
              className="p-2 rounded-lg border border-red-500/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
