import React from "react";
import Icons from "./Icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pestanas: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const maxVisible = 5;
  let startPage = Math.max(1, safePage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
  const activeIndex = visiblePages.indexOf(safePage);

  return (
    <div className="flex items-center justify-center gap-3 pt-2 border-t border-sidebar-separador shrink-0">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        disabled={safePage === 1}
        className="p-2 rounded-xl text-secondary border border-transparent hover:bg-gris hover:border-sidebar-separador disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
      >
        <Icons.ArrowRight className="w-5 h-5 rotate-180" />
      </button>

      <div className="flex items-center gap-1.5 relative p-1 bg-gris/20 rounded-xl overflow-hidden shrink-0">
        {/* Indicador Deslizante */}
        <div 
          className="absolute h-8 w-8 bg-[#e8893c]/10 border border-[#e8893c] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
          style={{ 
            transform: `translateX(${activeIndex * (32 + 6)}px)`,
          }}
        />

        {visiblePages.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onPageChange(Math.min(p, totalPages))}
            className={`relative z-10 w-8 h-8 rounded-lg text-sm font-bold transition-all duration-300 shrink-0 ${
              p === safePage
                ? "text-[#e8893c]"
                : "text-secondary hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        disabled={safePage === totalPages}
        className="p-2 rounded-xl text-secondary border border-transparent hover:bg-gris hover:border-sidebar-separador disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
      >
        <Icons.ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
